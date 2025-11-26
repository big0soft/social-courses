<?php

namespace App\Services;

class VolumeDiscountService
{
    /**
     * Volume discount tiers
     * Quantity => Discount Percentage
     */
    private const DISCOUNT_TIERS = [
        100 => 5,    // 100-249 cards: 5% discount
        250 => 10,   // 250-499 cards: 10% discount
        500 => 15,   // 500-999 cards: 15% discount
        1000 => 20,  // 1000+ cards: 20% discount
    ];

    /**
     * Calculate discount percentage based on quantity
     */
    public function calculateDiscount(int $quantity): float
    {
        $discount = 0;

        foreach (self::DISCOUNT_TIERS as $minQuantity => $discountPercent) {
            if ($quantity >= $minQuantity) {
                $discount = $discountPercent;
            }
        }

        return $discount;
    }

    /**
     * Calculate final price with volume discount
     */
    public function calculatePriceWithDiscount(float $basePrice, int $quantity): array
    {
        $discountPercent = $this->calculateDiscount($quantity);
        $discountAmount = ($basePrice * $quantity) * ($discountPercent / 100);
        $finalPrice = ($basePrice * $quantity) - $discountAmount;

        return [
            'base_price_per_card' => $basePrice,
            'quantity' => $quantity,
            'subtotal' => $basePrice * $quantity,
            'discount_percent' => $discountPercent,
            'discount_amount' => round($discountAmount, 2),
            'final_total' => round($finalPrice, 2),
            'price_per_card_after_discount' => round($finalPrice / $quantity, 2),
        ];
    }

    /**
     * Get all discount tiers for display
     */
    public function getDiscountTiers(): array
    {
        return self::DISCOUNT_TIERS;
    }

    /**
     * Calculate custom negotiated price
     */
    public function calculateCustomPrice(float $basePrice, int $quantity, float $customDiscountPercent): array
    {
        $discountAmount = ($basePrice * $quantity) * ($customDiscountPercent / 100);
        $finalPrice = ($basePrice * $quantity) - $discountAmount;

        return [
            'base_price_per_card' => $basePrice,
            'quantity' => $quantity,
            'subtotal' => $basePrice * $quantity,
            'discount_percent' => $customDiscountPercent,
            'discount_amount' => round($discountAmount, 2),
            'final_total' => round($finalPrice, 2),
            'price_per_card_after_discount' => round($finalPrice / $quantity, 2),
            'is_custom' => true,
        ];
    }
}
