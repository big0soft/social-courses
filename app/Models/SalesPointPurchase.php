<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesPointPurchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'sales_point_id',
        'admin_id',
        'invoice_number',
        'total_cards',
        'total_amount',
        'currency',
        'payment_status',
        'payment_method',
        'payment_date',
        'notes',
    ];

    protected $casts = [
        'payment_date' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the sales point that made this purchase
     */
    public function salesPoint(): BelongsTo
    {
        return $this->belongsTo(SalesPoint::class);
    }

    /**
     * Get the admin who processed this purchase
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the prepaid cards included in this purchase
     */
    public function cards(): HasMany
    {
        return $this->hasMany(PrepaidCard::class, 'sales_point_purchase_id');
    }

    /**
     * Get cards that have been redeemed from this purchase
     */
    public function redeemedCards(): HasMany
    {
        return $this->hasMany(PrepaidCard::class, 'sales_point_purchase_id')
            ->where('status', 'used');
    }

    /**
     * Get cards that are still active from this purchase
     */
    public function activeCards(): HasMany
    {
        return $this->hasMany(PrepaidCard::class, 'sales_point_purchase_id')
            ->where('status', 'active');
    }

    /**
     * Calculate redemption rate for this purchase
     */
    public function getRedemptionRateAttribute(): float
    {
        if ($this->total_cards === 0) {
            return 0;
        }

        $redeemedCount = $this->redeemedCards()->count();
        return ($redeemedCount / $this->total_cards) * 100;
    }

    /**
     * Check if payment is complete
     */
    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    /**
     * Mark as paid
     */
    public function markAsPaid(string $paymentMethod = null): void
    {
        $this->update([
            'payment_status' => 'paid',
            'payment_method' => $paymentMethod ?? $this->payment_method,
            'payment_date' => now(),
        ]);
    }
}
