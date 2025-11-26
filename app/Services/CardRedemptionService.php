<?php

namespace App\Services;

use App\Enums\CardType;
use App\Models\CardActivation;
use App\Models\Course\CourseEnrollment;
use App\Models\PrepaidCard;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CardRedemptionService
{
    private CardValidationService $validationService;

    public function __construct(CardValidationService $validationService)
    {
        $this->validationService = $validationService;
    }

    /**
     * Redeem a prepaid card for a user
     *
     * @return array ['success' => bool, 'message' => string, 'card' => PrepaidCard|null, 'enrollments' => array]
     */
    public function redeem(string $code, User $user, ?string $ipAddress = null, ?string $userAgent = null): array
    {
        // Validate the card
        $validation = $this->validationService->validate($code, $ipAddress);

        if (!$validation['valid']) {
            return [
                'success' => false,
                'message' => $validation['message'],
                'card' => $validation['card'],
                'enrollments' => [],
            ];
        }

        $card = $validation['card'];

        // Check if user already used this card
        if ($card->used_by === $user->id) {
            return [
                'success' => false,
                'message' => 'You have already redeemed this card.',
                'card' => $card,
                'enrollments' => [],
            ];
        }

        try {
            return DB::transaction(function () use ($card, $user, $ipAddress, $userAgent) {
                // Get courses to enroll
                $coursesToEnroll = $this->getCoursesToEnroll($card);

                if ($coursesToEnroll->isEmpty()) {
                    throw new \Exception('No courses found for this card.');
                }

                $enrollments = [];
                $courseIds = [];

                // Create enrollments for each course
                foreach ($coursesToEnroll as $course) {
                    // Check if user is already enrolled
                    $existingEnrollment = CourseEnrollment::where('user_id', $user->id)
                        ->where('course_id', $course->id)
                        ->first();

                    if ($existingEnrollment) {
                        // Skip already enrolled courses
                        continue;
                    }

                    // Create new enrollment
                    $enrollment = CourseEnrollment::create([
                        'user_id' => $user->id,
                        'course_id' => $course->id,
                        'enrollment_type' => 'lifetime', // Card-based enrollments are lifetime
                        'entry_date' => now(),
                        'expiry_date' => null, // Lifetime access
                    ]);

                    // Load course relationship for email notification
                    $enrollment->load('course:id,title');

                    $enrollments[] = $enrollment;
                    $courseIds[] = $course->id;
                }

                // Mark card as used
                $card->markAsUsed($user);

                // Create activation record
                CardActivation::create([
                    'prepaid_card_id' => $card->id,
                    'user_id' => $user->id,
                    'ip_address' => $ipAddress,
                    'user_agent' => $userAgent,
                    'activated_at' => now(),
                    'courses_enrolled' => $courseIds,
                ]);

                Log::info('Card redeemed successfully', [
                    'card_id' => $card->id,
                    'user_id' => $user->id,
                    'courses_count' => count($enrollments),
                    'ip' => $ipAddress,
                ]);

                return [
                    'success' => true,
                    'message' => 'Card redeemed successfully! You now have access to ' . count($enrollments) . ' course(s).',
                    'card' => $card->fresh(['course', 'bundleCourses']),
                    'enrollments' => $enrollments,
                ];
            });
        } catch (\Exception $e) {
            Log::error('Card redemption failed', [
                'card_id' => $card->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to redeem card: ' . $e->getMessage(),
                'card' => $card,
                'enrollments' => [],
            ];
        }
    }

    /**
     * Get courses to enroll based on card type
     */
    private function getCoursesToEnroll(PrepaidCard $card)
    {
        if ($card->card_type === CardType::SINGLE_COURSE) {
            if (!$card->course) {
                throw new \Exception('Course not found for this card.');
            }
            return collect([$card->course]);
        }

        if ($card->card_type === CardType::BUNDLE) {
            $courses = $card->bundleCourses;
            if ($courses->isEmpty()) {
                throw new \Exception('No courses found in this bundle.');
            }
            return $courses;
        }

        throw new \Exception('Invalid card type.');
    }

    /**
     * Check if user can redeem a card (already enrolled check)
     */
    public function canUserRedeem(PrepaidCard $card, User $user): array
    {
        $coursesToEnroll = $this->getCoursesToEnroll($card);
        $alreadyEnrolled = [];
        $canEnroll = [];

        foreach ($coursesToEnroll as $course) {
            $isEnrolled = CourseEnrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->exists();

            if ($isEnrolled) {
                $alreadyEnrolled[] = $course->title;
            } else {
                $canEnroll[] = $course->title;
            }
        }

        return [
            'can_redeem' => !empty($canEnroll),
            'courses_to_enroll' => $canEnroll,
            'already_enrolled' => $alreadyEnrolled,
            'message' => empty($canEnroll)
                ? 'You are already enrolled in all courses from this card.'
                : 'You can redeem this card for ' . count($canEnroll) . ' course(s).',
        ];
    }

    /**
     * Get user's card activation history
     */
    public function getUserActivationHistory(User $user)
    {
        return CardActivation::with(['prepaidCard.course', 'prepaidCard.bundleCourses'])
            ->where('user_id', $user->id)
            ->orderBy('activated_at', 'desc')
            ->get();
    }

    /**
     * Check if user has redeemed a specific card
     */
    public function hasUserRedeemedCard(User $user, PrepaidCard $card): bool
    {
        return CardActivation::where('user_id', $user->id)
            ->where('prepaid_card_id', $card->id)
            ->exists();
    }
}
