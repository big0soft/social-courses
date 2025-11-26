<?php

namespace App\Http\Controllers;

use App\Mail\CardRedeemedMail;
use App\Services\CardRedemptionService;
use App\Services\CardValidationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class CardRedemptionController extends Controller
{
    public function __construct(
        protected CardValidationService $validationService,
        protected CardRedemptionService $redemptionService
    ) {}

    /**
     * Show the card redemption form
     */
    public function index()
    {
        $user = Auth::user();

        // Get user's activation history
        $activations = $this->redemptionService->getUserActivationHistory($user);

        return Inertia::render('student/card-redemption/index', [
            'activations' => $activations,
        ]);
    }

    /**
     * Validate a card code (AJAX endpoint)
     */
    public function validate(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $ipAddress = $request->ip();
        $validation = $this->validationService->validate($request->code, $ipAddress);

        if (!$validation['valid']) {
            return response()->json([
                'valid' => false,
                'message' => $validation['message'],
            ], 422);
        }

        $card = $validation['card'];
        $user = Auth::user();

        // Check if user can redeem this card
        $canRedeem = $this->redemptionService->canUserRedeem($card, $user);

        // Get already enrolled course IDs
        $alreadyEnrolledIds = [];
        if ($card->card_type->value === 'single_course' && $card->course) {
            if (!empty($canRedeem['already_enrolled'])) {
                $alreadyEnrolledIds = [$card->course->id];
            }
        } elseif ($card->card_type->value === 'bundle') {
            foreach ($card->bundleCourses as $course) {
                if (in_array($course->title, $canRedeem['already_enrolled'])) {
                    $alreadyEnrolledIds[] = $course->id;
                }
            }
        }

        return response()->json([
            'valid' => true,
            'can_redeem' => $canRedeem['can_redeem'],
            'message' => $canRedeem['message'],
            'card' => [
                'code' => $card->code,
                'card_type' => $card->card_type->value,
                'title' => $card->title,
                'description' => $card->description,
                'price' => $card->price,
                'currency' => $card->currency,
                'course' => $card->course ? [
                    'id' => $card->course->id,
                    'title' => $card->course->title,
                ] : null,
                'bundleCourses' => $card->bundleCourses->map(fn($c) => [
                    'id' => $c->id,
                    'title' => $c->title,
                ])->toArray(),
                'alreadyEnrolled' => $alreadyEnrolledIds,
                'courses_to_enroll' => $canRedeem['courses_to_enroll'],
            ],
        ]);
    }

    /**
     * Redeem a prepaid card
     */
    public function redeem(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = Auth::user();
        $ipAddress = $request->ip();
        $userAgent = $request->userAgent();

        $result = $this->redemptionService->redeem(
            $request->code,
            $user,
            $ipAddress,
            $userAgent
        );

        if (!$result['success']) {
            return redirect()->back()
                ->with('error', $result['message'])
                ->withInput();
        }

        // Prepare course information for email (no card code included)
        $courses = [];
        foreach ($result['enrollments'] as $enrollment) {
            $courses[] = [
                'title' => $enrollment->course->title,
                'id' => $enrollment->course->id,
            ];
        }

        // Send email notification
        try {
            Mail::to($user->email)->send(new CardRedeemedMail(
                user: $user,
                courses: $courses,
                cardType: $result['card']->card_type->value,
                coursesEnrolled: count($courses)
            ));
        } catch (\Exception $e) {
            // Log email error but don't fail the redemption
            \Log::warning('Card redemption email failed', [
                'user_id' => $user->id,
                'card_id' => $result['card']->id,
                'error' => $e->getMessage(),
            ]);
        }

        // Send SMS notification if SMS service is configured
        try {
            if (class_exists('\App\Services\SmsService')) {
                $smsService = app(\App\Services\SmsService::class);
                if ($smsService->isEnabled() && $user->phone) {
                    $smsService->sendCardActivationNotification($user, $result['card']);
                }
            }
        } catch (\Exception $e) {
            // Log SMS error but don't fail the redemption
            \Log::warning('SMS notification failed', [
                'user_id' => $user->id,
                'card_id' => $result['card']->id,
                'error' => $e->getMessage(),
            ]);
        }

        return redirect()->back()
            ->with('success', $result['message']);
    }

    /**
     * Show activation history
     */
    public function history()
    {
        $user = Auth::user();
        $activations = $this->redemptionService->getUserActivationHistory($user);

        return Inertia::render('student/card-redemption/history', [
            'activations' => $activations,
        ]);
    }

    /**
     * Show checkout page with card option
     */
    public function checkout()
    {
        return Inertia::render('checkout/card', [
            'user' => Auth::user(),
        ]);
    }
}
