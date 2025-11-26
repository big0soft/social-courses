<?php

namespace App\Http\Controllers;

use App\Enums\CardStatus;
use App\Enums\CardType;
use App\Models\CardActivation;
use App\Models\Course\Course;
use App\Models\PrepaidCard;
use App\Services\CardGenerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class PrepaidCardController extends Controller
{
    public function __construct(
        protected CardGenerationService $cardGenerationService
    ) {}

    /**
     * Display a listing of prepaid cards
     */
    public function index(Request $request)
    {
        $query = PrepaidCard::with(['course', 'bundleCourses', 'usedByUser', 'creator']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('batch_id', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('card_type', $request->type);
        }

        // Filter by batch
        if ($request->filled('batch_id')) {
            $query->where('batch_id', $request->batch_id);
        }

        $cards = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->appends($request->query());

        $stats = [
            'total_cards' => PrepaidCard::count(),
            'active_cards' => PrepaidCard::where('status', CardStatus::ACTIVE)->count(),
            'used_cards' => PrepaidCard::where('status', CardStatus::USED)->count(),
            'expired_cards' => PrepaidCard::where('status', CardStatus::EXPIRED)->count(),
            'total_value' => PrepaidCard::where('status', CardStatus::ACTIVE)->sum('price'),
            'redeemed_value' => PrepaidCard::where('status', CardStatus::USED)->sum('price'),
            'recent_activations' => CardActivation::where('created_at', '>=', now()->subDays(7))->count(),
            'total_activations' => CardActivation::count(),
            'by_type' => [
                'single_course' => PrepaidCard::where('card_type', CardType::SINGLE_COURSE)->count(),
                'bundle' => PrepaidCard::where('card_type', CardType::BUNDLE)->count(),
            ],
        ];

        $filters = [
            'search' => $request->search,
            'status' => $request->status,
            'card_type' => $request->type,
            'batch_id' => $request->batch_id,
        ];

        $batches = PrepaidCard::select('batch_id')
            ->whereNotNull('batch_id')
            ->groupBy('batch_id')
            ->selectRaw('batch_id, count(*) as count, min(created_at) as created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('dashboard/prepaid-cards/index', compact('cards', 'stats', 'filters', 'batches'));
    }

    /**
     * Show the form for creating new cards
     */
    public function create()
    {
        $courses = Course::select('id', 'title', 'price')->orderBy('title')->get();
        $cardTypes = collect(CardType::cases())->map(fn ($type) => [
            'value' => $type->value,
            'label' => $type->getLabel(),
        ]);

        return Inertia::render('dashboard/prepaid-cards/create', compact('courses', 'cardTypes'));
    }

    /**
     * Store a newly created card
     */
    public function store(Request $request)
    {
        $rules = [
            'card_type' => 'required|in:single_course,bundle',
            'price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'expires_at' => 'nullable|date|after:today',
            'notes' => 'nullable|string|max:500',
            'quantity' => 'required|integer|min:1|max:1000',
        ];

        if ($request->card_type === 'single_course') {
            $rules['course_id'] = 'required|exists:courses,id';
        } else {
            $rules['title'] = 'required|string|max:255';
            $rules['description'] = 'nullable|string|max:1000';
            $rules['course_ids'] = 'required|array|min:2';
            $rules['course_ids.*'] = 'exists:courses,id';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $validated = $validator->validated();
        $quantity = $validated['quantity'];
        unset($validated['quantity']);

        try {
            if ($quantity === 1) {
                $card = $this->cardGenerationService->generateSingle($validated, Auth::user());
                $message = 'Card generated successfully: ' . $card->code;
            } else {
                $cards = $this->cardGenerationService->generateBulk($validated, Auth::user(), $quantity);
                $message = $quantity . ' cards generated successfully';
            }

            return redirect()->route('prepaid-cards.index')
                ->with('success', $message);
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to generate cards: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified card
     */
    public function show(string $id)
    {
        $card = PrepaidCard::with([
            'course',
            'bundleCourses',
            'usedByUser',
            'creator',
            'activation.user'
        ])->findOrFail($id);

        return Inertia::render('dashboard/prepaid-cards/show', compact('card'));
    }

    /**
     * Show the form for editing the specified card
     */
    public function edit(string $id)
    {
        $card = PrepaidCard::with(['course', 'bundleCourses'])->findOrFail($id);
        $courses = Course::select('id', 'title', 'price')->orderBy('title')->get();
        $cardTypes = collect(CardType::cases())->map(fn ($type) => [
            'value' => $type->value,
            'label' => $type->getLabel(),
        ]);

        return Inertia::render('dashboard/prepaid-cards/edit', compact('card', 'courses', 'cardTypes'));
    }

    /**
     * Update the specified card
     */
    public function update(Request $request, string $id)
    {
        $card = PrepaidCard::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:active,used,expired,disabled',
            'expires_at' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $card->update($validated);

        return redirect()->back()->with('success', 'Card updated successfully');
    }

    /**
     * Remove the specified card
     */
    public function destroy(string $id)
    {
        $card = PrepaidCard::findOrFail($id);

        if ($card->status === CardStatus::USED) {
            return redirect()->back()
                ->with('error', 'Cannot delete a used card');
        }

        $card->delete();

        return redirect()->route('prepaid-cards.index')
            ->with('success', 'Card deleted successfully');
    }

    /**
     * Export cards to CSV
     */
    public function export(Request $request)
    {
        $query = PrepaidCard::with(['course', 'bundleCourses']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('batch_id')) {
            $query->where('batch_id', $request->batch_id);
        }

        $cards = $query->get();
        $csv = $this->cardGenerationService->exportToCSV($cards);

        $filename = 'prepaid-cards-' . now()->format('Y-m-d-His') . '.csv';

        return response($csv)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Get card statistics
     */
    public function statistics()
    {
        $stats = [
            'total_cards' => PrepaidCard::count(),
            'active_cards' => PrepaidCard::where('status', CardStatus::ACTIVE)->count(),
            'used_cards' => PrepaidCard::where('status', CardStatus::USED)->count(),
            'expired_cards' => PrepaidCard::where('status', CardStatus::EXPIRED)->count(),
            'total_value' => PrepaidCard::sum('price'),
            'redeemed_value' => PrepaidCard::where('status', CardStatus::USED)->sum('price'),
            'recent_activations' => CardActivation::where('created_at', '>=', now()->subDays(7))->count(),
            'total_activations' => CardActivation::count(),
            'by_type' => [
                'single_course' => PrepaidCard::where('card_type', CardType::SINGLE_COURSE)->count(),
                'bundle' => PrepaidCard::where('card_type', CardType::BUNDLE)->count(),
            ],
        ];

        // Recent activations list
        $recentActivations = CardActivation::with(['prepaidCard', 'user'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($activation) {
                return [
                    'id' => $activation->id,
                    'prepaidCard' => [
                        'code' => $activation->prepaidCard->code,
                        'card_type' => $activation->prepaidCard->card_type->value,
                        'price' => $activation->prepaidCard->price,
                        'currency' => $activation->prepaidCard->currency,
                    ],
                    'user' => [
                        'name' => $activation->user->name,
                        'email' => $activation->user->email,
                    ],
                    'activated_at' => $activation->activated_at,
                ];
            });

        // Chart data
        $chartData = [
            'statusDistribution' => [
                'labels' => ['active', 'used', 'expired', 'disabled'],
                'values' => [
                    PrepaidCard::where('status', CardStatus::ACTIVE)->count(),
                    PrepaidCard::where('status', CardStatus::USED)->count(),
                    PrepaidCard::where('status', CardStatus::EXPIRED)->count(),
                    PrepaidCard::where('status', CardStatus::DISABLED)->count(),
                ],
            ],
            'typeDistribution' => [
                'single_course' => PrepaidCard::where('card_type', CardType::SINGLE_COURSE)->count(),
                'bundle' => PrepaidCard::where('card_type', CardType::BUNDLE)->count(),
            ],
            'activationTrend' => collect(range(6, 0))->map(function ($daysAgo) {
                $date = now()->subDays($daysAgo)->startOfDay();
                return [
                    'date' => $date->toDateString(),
                    'count' => CardActivation::whereDate('activated_at', $date)->count(),
                ];
            })->values(),
        ];

        return Inertia::render('dashboard/prepaid-cards/statistics', [
            'statistics' => $stats,
            'recentActivations' => $recentActivations,
            'chartData' => $chartData,
        ]);
    }

    /**
     * Get list of batches
     */
    public function batches()
    {
        $batches = PrepaidCard::select('batch_id')
            ->whereNotNull('batch_id')
            ->groupBy('batch_id')
            ->withCount('batch_id')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($batches);
    }
}
