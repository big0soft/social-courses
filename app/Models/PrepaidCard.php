<?php

namespace App\Models;

use App\Enums\CardStatus;
use App\Enums\CardType;
use App\Models\Course\Course;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PrepaidCard extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'card_type',
        'title',
        'description',
        'price',
        'currency',
        'course_id',
        'status',
        'used_by',
        'used_at',
        'expires_at',
        'created_by',
        'batch_id',
        'notes',
        'sales_point_id',
        'sales_point_purchase_id',
        'sold_to_sales_point_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'used_at' => 'datetime',
        'expires_at' => 'datetime',
        'sold_to_sales_point_at' => 'datetime',
        'card_type' => CardType::class,
        'status' => CardStatus::class,
    ];

    /**
     * Get the course for single course card
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the courses for bundle card (many-to-many)
     */
    public function bundleCourses(): BelongsToMany
    {
        return $this->belongsToMany(Course::class, 'prepaid_card_courses')
            ->withTimestamps();
    }

    /**
     * Get the user who used this card
     */
    public function usedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'used_by');
    }

    /**
     * Get the admin who created this card
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the activation record
     */
    public function activation(): HasOne
    {
        return $this->hasOne(CardActivation::class, 'prepaid_card_id');
    }

    /**
     * Get the sales point that owns this card
     */
    public function salesPoint(): BelongsTo
    {
        return $this->belongsTo(SalesPoint::class);
    }

    /**
     * Get the purchase record for this card
     */
    public function salesPointPurchase(): BelongsTo
    {
        return $this->belongsTo(SalesPointPurchase::class);
    }

    /**
     * Scope to get active cards
     */
    public function scopeActive($query)
    {
        return $query->where('status', CardStatus::ACTIVE)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    /**
     * Scope to get used cards
     */
    public function scopeUsed($query)
    {
        return $query->where('status', CardStatus::USED);
    }

    /**
     * Scope to get expired cards
     */
    public function scopeExpired($query)
    {
        return $query->where('status', CardStatus::EXPIRED)
            ->orWhere(function ($q) {
                $q->where('expires_at', '<=', now())
                    ->where('status', CardStatus::ACTIVE);
            });
    }

    /**
     * Scope to filter by batch
     */
    public function scopeByBatch($query, $batchId)
    {
        return $query->where('batch_id', $batchId);
    }

    /**
     * Check if card is valid for use
     */
    public function isValid(): bool
    {
        if ($this->status !== CardStatus::ACTIVE) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Check if card is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Mark card as used
     */
    public function markAsUsed(User $user): void
    {
        $this->update([
            'status' => CardStatus::USED,
            'used_by' => $user->id,
            'used_at' => now(),
        ]);
    }

    /**
     * Get all courses this card provides access to
     */
    public function getAccessibleCourses()
    {
        if ($this->card_type === CardType::SINGLE_COURSE) {
            return collect([$this->course]);
        }

        return $this->bundleCourses;
    }
}
