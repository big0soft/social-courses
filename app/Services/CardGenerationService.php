<?php

namespace App\Services;

use App\Enums\CardStatus;
use App\Enums\CardType;
use App\Models\PrepaidCard;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CardGenerationService
{
    private const CODE_PREFIX = 'BETA';
    private const CODE_SEGMENTS = 3;
    private const SEGMENT_LENGTH = 4;
    private const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters: I, O, 0, 1

    /**
     * Generate a single prepaid card
     */
    public function generateSingle(array $data, User $creator): PrepaidCard
    {
        return DB::transaction(function () use ($data, $creator) {
            $code = $this->generateUniqueCode();

            $cardData = [
                'code' => $code,
                'card_type' => $data['card_type'],
                'title' => $data['title'] ?? null,
                'description' => $data['description'] ?? null,
                'price' => $data['price'],
                'currency' => $data['currency'] ?? 'USD',
                'status' => CardStatus::ACTIVE,
                'expires_at' => $data['expires_at'] ?? null,
                'created_by' => $creator->id,
                'notes' => $data['notes'] ?? null,
            ];

            // Handle single course card
            if ($data['card_type'] === CardType::SINGLE_COURSE->value) {
                $cardData['course_id'] = $data['course_id'];
            }

            $card = PrepaidCard::create($cardData);

            // Handle bundle card - attach courses
            if ($data['card_type'] === CardType::BUNDLE->value && isset($data['course_ids'])) {
                $card->bundleCourses()->attach($data['course_ids']);
            }

            return $card;
        });
    }

    /**
     * Generate multiple prepaid cards in bulk
     */
    public function generateBulk(array $data, User $creator, int $quantity): Collection
    {
        return DB::transaction(function () use ($data, $creator, $quantity) {
            $batchId = $this->generateBatchId();
            $cards = collect();

            for ($i = 0; $i < $quantity; $i++) {
                $code = $this->generateUniqueCode();

                $cardData = [
                    'code' => $code,
                    'card_type' => $data['card_type'],
                    'title' => $data['title'] ?? null,
                    'description' => $data['description'] ?? null,
                    'price' => $data['price'],
                    'currency' => $data['currency'] ?? 'USD',
                    'status' => CardStatus::ACTIVE,
                    'expires_at' => $data['expires_at'] ?? null,
                    'created_by' => $creator->id,
                    'batch_id' => $batchId,
                    'notes' => $data['notes'] ?? null,
                ];

                // Handle single course card
                if ($data['card_type'] === CardType::SINGLE_COURSE->value) {
                    $cardData['course_id'] = $data['course_id'];
                }

                $card = PrepaidCard::create($cardData);

                // Handle bundle card - attach courses
                if ($data['card_type'] === CardType::BUNDLE->value && isset($data['course_ids'])) {
                    $card->bundleCourses()->attach($data['course_ids']);
                }

                $cards->push($card);
            }

            return $cards;
        });
    }

    /**
     * Generate a unique card code
     */
    private function generateUniqueCode(int $maxAttempts = 10): string
    {
        $attempts = 0;

        do {
            $code = $this->generateCode();
            $exists = PrepaidCard::where('code', $code)->exists();
            $attempts++;

            if ($attempts >= $maxAttempts) {
                throw new \RuntimeException('Failed to generate unique card code after ' . $maxAttempts . ' attempts');
            }
        } while ($exists);

        return $code;
    }

    /**
     * Generate a card code with format: BETA-XXXX-XXXX-XXXX
     */
    private function generateCode(): string
    {
        $segments = [];

        for ($i = 0; $i < self::CODE_SEGMENTS; $i++) {
            $segments[] = $this->generateSegment();
        }

        return self::CODE_PREFIX . '-' . implode('-', $segments);
    }

    /**
     * Generate a random segment of the code
     */
    private function generateSegment(): string
    {
        $segment = '';
        $charactersLength = strlen(self::CHARACTERS);

        for ($i = 0; $i < self::SEGMENT_LENGTH; $i++) {
            $randomIndex = random_int(0, $charactersLength - 1);
            $segment .= self::CHARACTERS[$randomIndex];
        }

        return $segment;
    }

    /**
     * Generate a unique batch ID
     */
    private function generateBatchId(): string
    {
        return 'BATCH-' . now()->format('YmdHis') . '-' . Str::random(6);
    }

    /**
     * Export cards to CSV format
     */
    public function exportToCSV(Collection $cards): string
    {
        $csv = "Card Code,Type,Title,Price,Currency,Status,Course,Created At,Expires At\n";

        foreach ($cards as $card) {
            $courseName = '';

            if ($card->card_type === CardType::SINGLE_COURSE && $card->course) {
                $courseName = $card->course->title;
            } elseif ($card->card_type === CardType::BUNDLE) {
                $courseName = $card->bundleCourses->pluck('title')->implode('; ');
            }

            $csv .= sprintf(
                '"%s","%s","%s","%s","%s","%s","%s","%s","%s"' . "\n",
                $card->code,
                $card->card_type->getLabel(),
                $card->title ?? '',
                $card->price,
                $card->currency,
                $card->status->getLabel(),
                $courseName,
                $card->created_at->format('Y-m-d H:i:s'),
                $card->expires_at ? $card->expires_at->format('Y-m-d H:i:s') : 'Never'
            );
        }

        return $csv;
    }

    /**
     * Validate card code format
     */
    public function validateCodeFormat(string $code): bool
    {
        // Format: BETA-XXXX-XXXX-XXXX
        $pattern = '/^' . self::CODE_PREFIX . '-[A-Z0-9]{' . self::SEGMENT_LENGTH . '}-[A-Z0-9]{' . self::SEGMENT_LENGTH . '}-[A-Z0-9]{' . self::SEGMENT_LENGTH . '}$/';

        return preg_match($pattern, strtoupper($code)) === 1;
    }

    /**
     * Normalize card code (remove spaces, convert to uppercase)
     */
    public function normalizeCode(string $code): string
    {
        return strtoupper(trim(str_replace(' ', '', $code)));
    }
}
