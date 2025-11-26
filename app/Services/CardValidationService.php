<?php

namespace App\Services;

use App\Enums\CardStatus;
use App\Models\PrepaidCard;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class CardValidationService
{
    private const RATE_LIMIT_KEY = 'card_validation';
    private const MAX_ATTEMPTS = 5; // Max attempts per IP per minute
    private const DECAY_MINUTES = 1;

    /**
     * Validate a card code
     *
     * @return array ['valid' => bool, 'message' => string, 'card' => PrepaidCard|null]
     */
    public function validate(string $code, ?string $ipAddress = null): array
    {
        // Check rate limiting
        if ($ipAddress && $this->isRateLimited($ipAddress)) {
            Log::warning('Card validation rate limit exceeded', [
                'ip' => $ipAddress,
                'code_attempted' => substr($code, 0, 4) . '****', // Log only prefix
            ]);

            return [
                'valid' => false,
                'message' => 'Too many validation attempts. Please try again later.',
                'card' => null,
            ];
        }

        // Normalize code
        $cardGenerationService = new CardGenerationService();
        $normalizedCode = $cardGenerationService->normalizeCode($code);

        // Validate format
        if (!$cardGenerationService->validateCodeFormat($normalizedCode)) {
            $this->incrementRateLimiter($ipAddress);
            return [
                'valid' => false,
                'message' => 'Invalid card code format.',
                'card' => null,
            ];
        }

        // Find card
        $card = PrepaidCard::where('code', $normalizedCode)->first();

        if (!$card) {
            $this->incrementRateLimiter($ipAddress);
            Log::info('Card validation failed - card not found', [
                'code' => substr($normalizedCode, 0, 4) . '****',
                'ip' => $ipAddress,
            ]);

            return [
                'valid' => false,
                'message' => 'Card code not found.',
                'card' => null,
            ];
        }

        // Check if already used
        if ($card->status === CardStatus::USED) {
            return [
                'valid' => false,
                'message' => 'This card has already been used.',
                'card' => $card,
            ];
        }

        // Check if disabled
        if ($card->status === CardStatus::DISABLED) {
            return [
                'valid' => false,
                'message' => 'This card has been disabled.',
                'card' => $card,
            ];
        }

        // Check if expired (status)
        if ($card->status === CardStatus::EXPIRED) {
            return [
                'valid' => false,
                'message' => 'This card has expired.',
                'card' => $card,
            ];
        }

        // Check if expired (date)
        if ($card->isExpired()) {
            return [
                'valid' => false,
                'message' => 'This card has expired on ' . $card->expires_at->format('Y-m-d') . '.',
                'card' => $card,
            ];
        }

        // Card is valid
        Log::info('Card validated successfully', [
            'card_id' => $card->id,
            'code' => substr($normalizedCode, 0, 4) . '****',
            'ip' => $ipAddress,
        ]);

        return [
            'valid' => true,
            'message' => 'Card is valid and ready to be redeemed.',
            'card' => $card,
        ];
    }

    /**
     * Quick validation - check if card exists and is active
     */
    public function quickValidate(string $code): bool
    {
        $cardGenerationService = new CardGenerationService();
        $normalizedCode = $cardGenerationService->normalizeCode($code);

        if (!$cardGenerationService->validateCodeFormat($normalizedCode)) {
            return false;
        }

        return PrepaidCard::where('code', $normalizedCode)
            ->where('status', CardStatus::ACTIVE)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    /**
     * Check if IP is rate limited
     */
    private function isRateLimited(?string $ipAddress): bool
    {
        if (!$ipAddress) {
            return false;
        }

        $key = $this->getRateLimitKey($ipAddress);
        return RateLimiter::tooManyAttempts($key, self::MAX_ATTEMPTS);
    }

    /**
     * Increment rate limiter
     */
    private function incrementRateLimiter(?string $ipAddress): void
    {
        if (!$ipAddress) {
            return;
        }

        $key = $this->getRateLimitKey($ipAddress);
        RateLimiter::hit($key, self::DECAY_MINUTES * 60);
    }

    /**
     * Get rate limit key
     */
    private function getRateLimitKey(string $ipAddress): string
    {
        return self::RATE_LIMIT_KEY . ':' . $ipAddress;
    }

    /**
     * Clear rate limiter for an IP
     */
    public function clearRateLimit(string $ipAddress): void
    {
        $key = $this->getRateLimitKey($ipAddress);
        RateLimiter::clear($key);
    }

    /**
     * Get remaining attempts for an IP
     */
    public function getRemainingAttempts(string $ipAddress): int
    {
        $key = $this->getRateLimitKey($ipAddress);
        $attempts = RateLimiter::attempts($key);
        return max(0, self::MAX_ATTEMPTS - $attempts);
    }

    /**
     * Check if a card can be used for a specific course
     *
     * @param PrepaidCard $card
     * @param int $courseId
     * @return bool
     */
    public function canBeUsedForCourse(PrepaidCard $card, int $courseId): bool
    {
        if ($card->card_type->value === 'single_course') {
            return $card->course_id === $courseId;
        }

        if ($card->card_type->value === 'bundle') {
            return $card->bundleCourses()->where('course_id', $courseId)->exists();
        }

        return false;
    }

    /**
     * Check if a card can be used for a set of courses
     *
     * @param PrepaidCard $card
     * @param array $courseIds Array of course IDs
     * @return array ['can_use' => bool, 'matching_courses' => array, 'missing_courses' => array]
     */
    public function canBeUsedForCourses(PrepaidCard $card, array $courseIds): array
    {
        $courseIds = array_values($courseIds); // Reset array keys

        if ($card->card_type->value === 'single_course') {
            $canUse = in_array($card->course_id, $courseIds);
            return [
                'can_use' => $canUse,
                'matching_courses' => $canUse ? [$card->course_id] : [],
                'missing_courses' => $canUse ? array_diff($courseIds, [$card->course_id]) : $courseIds,
            ];
        }

        if ($card->card_type->value === 'bundle') {
            $bundleCourseIds = $card->bundleCourses()->pluck('course_id')->toArray();
            $matchingCourses = array_intersect($courseIds, $bundleCourseIds);
            $missingCourses = array_diff($courseIds, $bundleCourseIds);

            return [
                'can_use' => !empty($matchingCourses),
                'matching_courses' => array_values($matchingCourses),
                'missing_courses' => array_values($missingCourses),
            ];
        }

        return [
            'can_use' => false,
            'matching_courses' => [],
            'missing_courses' => $courseIds,
        ];
    }
}
