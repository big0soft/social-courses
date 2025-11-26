<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CardActivation extends Model
{
    use HasFactory;

    protected $fillable = [
        'prepaid_card_id',
        'user_id',
        'ip_address',
        'user_agent',
        'activated_at',
        'courses_enrolled',
    ];

    protected $casts = [
        'activated_at' => 'datetime',
        'courses_enrolled' => 'array',
    ];

    /**
     * Get the prepaid card
     */
    public function prepaidCard(): BelongsTo
    {
        return $this->belongsTo(PrepaidCard::class);
    }

    /**
     * Get the user who activated the card
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get activations by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get recent activations
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('activated_at', '>=', now()->subDays($days));
    }
}
