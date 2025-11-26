<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\InvoiceCreatedMail;
use App\Models\Course\Course;
use App\Models\PrepaidCard;
use App\Models\SalesPoint;
use App\Models\SalesPointPurchase;
use App\Services\CardGenerationService;
use App\Services\VolumeDiscountService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class SalesPointPurchaseController extends Controller
{
    public function __construct(
        protected VolumeDiscountService $discountService,
        protected CardGenerationService $cardService
    ) {}

    /**
     * Display list of all purchases
     */
    public function index(Request $request)
    {
        $query = SalesPointPurchase::with(['salesPoint', 'admin']);

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('invoice_number', 'like', "%{$request->search}%")
                    ->orWhereHas('salesPoint', function ($sq) use ($request) {
                        $sq->where('name', 'like', "%{$request->search}%");
                    });
            });
        }

        // Filter by sales point
        if ($request->filled('sales_point_id')) {
            $query->where('sales_point_id', $request->sales_point_id);
        }

        // Filter by payment status
        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        $purchases = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->appends($request->query());

        // Calculate stats
        $stats = [
            'total_purchases' => SalesPointPurchase::count(),
            'total_revenue' => SalesPointPurchase::where('payment_status', 'paid')->sum('total_amount'),
            'pending_payments' => SalesPointPurchase::where('payment_status', 'pending')->sum('total_amount'),
            'total_cards_sold' => SalesPointPurchase::sum('total_cards'),
        ];

        $salesPoints = SalesPoint::where('status', 'approved')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('dashboard/sales-point-purchases/index', [
            'purchases' => $purchases,
            'stats' => $stats,
            'salesPoints' => $salesPoints,
            'filters' => [
                'search' => $request->search,
                'sales_point_id' => $request->sales_point_id,
                'payment_status' => $request->payment_status,
            ],
        ]);
    }

    /**
     * Show form for creating new purchase
     */
    public function create()
    {
        $salesPoints = SalesPoint::where('status', 'approved')
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'email', 'address']);

        // Get available cards (not sold to sales points yet)
        $availableCards = PrepaidCard::whereNull('sales_point_id')
            ->where('status', 'active')
            ->select('id', 'code', 'card_type', 'price', 'batch_id')
            ->with('course:id,title')
            ->get()
            ->groupBy('batch_id');

        // Get available courses for card generation
        $courses = Course::where('status', 'published')
            ->orderBy('title')
            ->get(['id', 'title', 'price']);

        return Inertia::render('dashboard/sales-point-purchases/create', [
            'salesPoints' => $salesPoints,
            'availableCards' => $availableCards,
            'courses' => $courses,
        ]);
    }

    /**
     * Store new purchase
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sales_point_id' => 'required|exists:sales_points,id',
            'card_source' => 'required|in:existing,generate',
            'existing_card_ids' => [
                'required_if:card_source,existing',
                'array',
                function ($attribute, $value, $fail) {
                    if (!is_array($value)) {
                        return;
                    }
                    // Check if any cards are already assigned to a sales point
                    $assignedCards = \App\Models\PrepaidCard::whereIn('id', $value)
                        ->whereNotNull('sales_point_id')
                        ->count();
                    if ($assignedCards > 0) {
                        $fail('Some selected cards are already assigned to a sales point. Please select only unassigned cards.');
                    }
                    // Check if any cards are already used
                    $usedCards = \App\Models\PrepaidCard::whereIn('id', $value)
                        ->where('status', \App\Enums\CardStatus::USED)
                        ->count();
                    if ($usedCards > 0) {
                        $fail('Some selected cards have already been used and cannot be assigned.');
                    }
                }
            ],
            'existing_card_ids.*' => 'exists:prepaid_cards,id',
            'card_batches' => [
                'required_if:card_source,generate',
                'array',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->card_source === 'generate' && (empty($value) || count($value) < 1)) {
                        $fail('The card batches field must have at least 1 items when generating new cards.');
                    }
                },
            ],
            'card_batches.*.card_type' => 'required|in:single_course,bundle',
            'card_batches.*.course_id' => 'required_if:card_batches.*.card_type,single_course|exists:courses,id',
            'card_batches.*.course_ids' => 'required_if:card_batches.*.card_type,bundle|array|min:2',
            'card_batches.*.course_ids.*' => 'exists:courses,id',
            'card_batches.*.quantity' => 'required|integer|min:1',
            'card_batches.*.price' => 'required|numeric|min:0',
            'card_batches.*.title' => 'nullable|string|max:255',
            'card_batches.*.description' => 'nullable|string|max:1000',
            'card_batches.*.expires_at' => 'nullable|date|after:today',
            'card_batches.*.notes' => 'nullable|string|max:1000',
            'total_cards' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0.01',
            'payment_status' => 'required|in:paid,pending,partial',
            'payment_method' => 'nullable|string',
            'payment_date' => 'nullable|date',
            'credit_days' => 'nullable|integer|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            return DB::transaction(function () use ($validated) {
                // Calculate pricing (simple total without discounts)
                $pricing = [
                    'base_price_per_card' => $validated['base_price'],
                    'quantity' => $validated['total_cards'],
                    'subtotal' => $validated['base_price'] * $validated['total_cards'],
                    'discount_percent' => 0,
                    'discount_amount' => 0,
                    'final_total' => $validated['base_price'] * $validated['total_cards'],
                    'price_per_card_after_discount' => $validated['base_price'],
                ];

                // Generate unique invoice number
                $invoiceNumber = 'SP-' . date('Y') . '-' . str_pad(
                    SalesPointPurchase::whereYear('created_at', date('Y'))->count() + 1,
                    5,
                    '0',
                    STR_PAD_LEFT
                );

                // Create purchase record
                $purchase = SalesPointPurchase::create([
                    'sales_point_id' => $validated['sales_point_id'],
                    'admin_id' => Auth::id(),
                    'invoice_number' => $invoiceNumber,
                    'total_cards' => $validated['total_cards'],
                    'total_amount' => $pricing['final_total'],
                    'payment_status' => $validated['payment_status'],
                    'payment_method' => $validated['payment_method'] ?? null,
                    'payment_date' => $validated['payment_status'] === 'paid'
                        ? ($validated['payment_date'] ?? now())
                        : null,
                    'notes' => $validated['notes'] ?? null,
                ]);

                // Handle cards
                if ($validated['card_source'] === 'existing') {
                    // Assign existing cards to this purchase
                    PrepaidCard::whereIn('id', $validated['existing_card_ids'])
                        ->update([
                            'sales_point_id' => $validated['sales_point_id'],
                            'sales_point_purchase_id' => $purchase->id,
                            'sold_to_sales_point_at' => now(),
                        ]);
                } else {
                    // Generate new cards in batches
                    foreach ($validated['card_batches'] as $batch) {
                        // Prepare card data for this batch
                        $cardData = [
                            'card_type' => $batch['card_type'],
                            'price' => $batch['price'],
                            'currency' => 'USD',
                            'title' => $batch['title'] ?? null,
                            'description' => $batch['description'] ?? null,
                            'expires_at' => $batch['expires_at'] ?? null,
                            'notes' => $batch['notes'] ?? null,
                        ];

                        // Add course data based on card type
                        if ($batch['card_type'] === 'single_course') {
                            $cardData['course_id'] = $batch['course_id'];
                        } else {
                            $cardData['course_ids'] = $batch['course_ids'];
                        }

                        // Generate cards for this batch
                        $cards = $this->cardService->generateBulk(
                            $cardData,
                            Auth::user(),
                            $batch['quantity']
                        );

                        // Assign to sales point
                        foreach ($cards as $card) {
                            $card->update([
                                'sales_point_id' => $validated['sales_point_id'],
                                'sales_point_purchase_id' => $purchase->id,
                                'sold_to_sales_point_at' => now(),
                            ]);
                        }
                    }
                }

                // Send invoice email automatically
                try {
                    $purchase->load([
                        'salesPoint',
                        'admin',
                        'cards.course',
                        'cards.bundleCourses',
                    ]);

                    // Generate PDF
                    $pricing = [
                        'base_price_per_card' => $validated['base_price'],
                        'quantity' => $validated['total_cards'],
                        'subtotal' => $validated['base_price'] * $validated['total_cards'],
                        'discount_percent' => 0,
                        'discount_amount' => 0,
                        'final_total' => $validated['base_price'] * $validated['total_cards'],
                        'price_per_card_after_discount' => $validated['base_price'],
                    ];

                    $pdf = Pdf::loadView('invoices.sales-point-purchase', [
                        'purchase' => $purchase,
                        'pricing' => $pricing,
                    ]);

                    // Save temporary PDF
                    $pdfPath = storage_path('app/temp/invoice-' . $purchase->invoice_number . '.pdf');
                    if (!file_exists(dirname($pdfPath))) {
                        mkdir(dirname($pdfPath), 0755, true);
                    }
                    $pdf->save($pdfPath);

                    // Send email
                    Mail::to($purchase->salesPoint->email)->send(
                        new InvoiceCreatedMail($purchase, $pdfPath)
                    );

                    // Clean up
                    if (file_exists($pdfPath)) {
                        unlink($pdfPath);
                    }
                } catch (\Exception $e) {
                    // Log error but don't fail the purchase
                    logger()->error('Failed to send invoice email: ' . $e->getMessage());
                }

                return redirect()->route('sales-point-purchases.show', $purchase)
                    ->with('success', "Purchase created successfully! Invoice {$invoiceNumber} sent to {$purchase->salesPoint->email}");
            });
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create purchase: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display purchase details
     */
    public function show(SalesPointPurchase $salesPointPurchase)
    {
        $salesPointPurchase->load([
            'salesPoint',
            'admin',
            'cards.course',
            'cards.bundleCourses',
            'redeemedCards',
            'activeCards',
        ]);

        return Inertia::render('dashboard/sales-point-purchases/show', [
            'purchase' => $salesPointPurchase,
            'redemption_rate' => $salesPointPurchase->redemption_rate,
        ]);
    }

    /**
     * Update purchase (mainly for payment status)
     */
    public function update(Request $request, SalesPointPurchase $salesPointPurchase)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:paid,pending,partial,refunded',
            'payment_method' => 'nullable|string',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validated['payment_status'] === 'paid' && !$salesPointPurchase->isPaid()) {
            $validated['payment_date'] = $validated['payment_date'] ?? now();
        }

        $salesPointPurchase->update($validated);

        return redirect()->back()
            ->with('success', 'Purchase updated successfully');
    }

    /**
     * Get revenue analytics
     */
    public function analytics(Request $request)
    {
        $period = $request->get('period', '30'); // days

        $analytics = [
            'total_revenue' => SalesPointPurchase::where('payment_status', 'paid')->sum('total_amount'),
            'pending_revenue' => SalesPointPurchase::where('payment_status', 'pending')->sum('total_amount'),
            'total_cards_sold' => SalesPointPurchase::sum('total_cards'),
            'total_cards_redeemed' => PrepaidCard::whereNotNull('sales_point_id')
                ->where('status', 'used')
                ->count(),
            'by_sales_point' => SalesPoint::withCount(['purchases', 'prepaidCards'])
                ->withSum('purchases', 'total_amount')
                ->withSum('purchases', 'total_cards')
                ->get(),
            'recent_purchases' => SalesPointPurchase::with(['salesPoint', 'admin'])
                ->where('created_at', '>=', now()->subDays($period))
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
            'revenue_by_month' => SalesPointPurchase::selectRaw('
                    DATE_FORMAT(created_at, "%Y-%m") as month,
                    SUM(total_amount) as revenue,
                    SUM(total_cards) as cards,
                    COUNT(*) as purchases
                ')
                ->where('created_at', '>=', now()->subMonths(12))
                ->groupBy('month')
                ->orderBy('month')
                ->get(),
        ];

        return Inertia::render('dashboard/sales-point-purchases/analytics', [
            'analytics' => $analytics,
            'period' => $period,
        ]);
    }

    /**
     * Calculate price preview with discounts
     */
    public function calculatePrice(Request $request)
    {
        $validated = $request->validate([
            'base_price' => 'required|numeric|min:0.01',
            'quantity' => 'required|integer|min:1',
        ]);

        // Simple pricing calculation without discounts
        $pricing = [
            'base_price_per_card' => $validated['base_price'],
            'quantity' => $validated['quantity'],
            'subtotal' => $validated['base_price'] * $validated['quantity'],
            'discount_percent' => 0,
            'discount_amount' => 0,
            'final_total' => $validated['base_price'] * $validated['quantity'],
            'price_per_card_after_discount' => $validated['base_price'],
        ];

        return response()->json($pricing);
    }

    /**
     * Download invoice as PDF
     */
    public function downloadInvoice(SalesPointPurchase $salesPointPurchase)
    {
        $purchase = $salesPointPurchase->load([
            'salesPoint',
            'admin',
            'cards.course',
            'cards.bundleCourses',
            'redeemedCards',
            'activeCards',
        ]);

        // Calculate pricing breakdown if available
        $pricing = null;
        if ($purchase->total_cards > 0) {
            $basePrice = $purchase->total_amount / $purchase->total_cards;
            $pricing = [
                'base_price_per_card' => $basePrice,
                'quantity' => $purchase->total_cards,
                'subtotal' => $purchase->total_amount,
                'discount_percent' => 0,
                'discount_amount' => 0,
                'final_total' => $purchase->total_amount,
                'price_per_card_after_discount' => $basePrice,
            ];
        }

        $pdf = Pdf::loadView('invoices.sales-point-purchase', [
            'purchase' => $purchase,
            'pricing' => $pricing,
        ]);

        return $pdf->download('Invoice-' . $purchase->invoice_number . '.pdf');
    }

    /**
     * Send invoice via email
     */
    public function emailInvoice(Request $request, SalesPointPurchase $salesPointPurchase)
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $purchase = $salesPointPurchase->load([
            'salesPoint',
            'admin',
            'cards.course',
            'cards.bundleCourses',
            'redeemedCards',
            'activeCards',
        ]);

        try {
            // Generate PDF
            $pricing = null;
            if ($purchase->total_cards > 0) {
                $basePrice = $purchase->total_amount / $purchase->total_cards;
                $pricing = [
                    'base_price_per_card' => $basePrice,
                    'quantity' => $purchase->total_cards,
                    'subtotal' => $purchase->total_amount,
                    'discount_percent' => 0,
                    'discount_amount' => 0,
                    'final_total' => $purchase->total_amount,
                    'price_per_card_after_discount' => $basePrice,
                ];
            }

            $pdf = Pdf::loadView('invoices.sales-point-purchase', [
                'purchase' => $purchase,
                'pricing' => $pricing,
            ]);

            // Save temporary PDF
            $pdfPath = storage_path('app/temp/invoice-' . $purchase->invoice_number . '.pdf');

            // Ensure temp directory exists
            if (!file_exists(dirname($pdfPath))) {
                mkdir(dirname($pdfPath), 0755, true);
            }

            $pdf->save($pdfPath);

            // Send email with PDF attachment
            Mail::to($validated['email'])->send(
                new InvoiceCreatedMail($purchase, $pdfPath)
            );

            // Clean up temporary file
            if (file_exists($pdfPath)) {
                unlink($pdfPath);
            }

            return redirect()->back()->with('success', 'Invoice sent successfully to ' . $validated['email']);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to send invoice: ' . $e->getMessage());
        }
    }

    /**
     * View invoice in browser
     */
    public function viewInvoice(SalesPointPurchase $salesPointPurchase)
    {
        $purchase = $salesPointPurchase->load([
            'salesPoint',
            'admin',
            'cards.course',
            'cards.bundleCourses',
            'redeemedCards',
            'activeCards',
        ]);

        // Calculate pricing breakdown if available
        $pricing = null;
        if ($purchase->total_cards > 0) {
            $basePrice = $purchase->total_amount / $purchase->total_cards;
            $pricing = [
                'base_price_per_card' => $basePrice,
                'quantity' => $purchase->total_cards,
                'subtotal' => $purchase->total_amount,
                'discount_percent' => 0,
                'discount_amount' => 0,
                'final_total' => $purchase->total_amount,
                'price_per_card_after_discount' => $basePrice,
            ];
        }

        $pdf = Pdf::loadView('invoices.sales-point-purchase', [
            'purchase' => $purchase,
            'pricing' => $pricing,
        ]);

        return $pdf->stream('Invoice-' . $purchase->invoice_number . '.pdf');
    }
}
