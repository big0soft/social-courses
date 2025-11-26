<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalesPoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'region',
        'city',
        'country',
        'latitude',
        'longitude',
        'phone',
        'email',
        'website',
        'description',
        'image',
        'status',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * Get the admin who created this sales point
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get all purchases made by this sales point
     */
    public function purchases(): HasMany
    {
        return $this->hasMany(SalesPointPurchase::class);
    }

    /**
     * Get all prepaid cards assigned to this sales point
     */
    public function prepaidCards(): HasMany
    {
        return $this->hasMany(PrepaidCard::class);
    }

    /**
     * Scope to get approved sales points
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope to get disabled sales points
     */
    public function scopeDisabled($query)
    {
        return $query->where('status', 'disabled');
    }

    /**
     * Scope to filter by region
     */
    public function scopeByRegion($query, $region)
    {
        return $query->where('region', $region);
    }

    /**
     * Scope to filter by city
     */
    public function scopeByCity($query, $city)
    {
        return $query->where('city', $city);
    }

    /**
     * Scope to search by name or address
     */
    public function scopeSearch($query, $search)
    {
        // Escape LIKE wildcard characters to prevent SQL injection
        $escapedSearch = str_replace(['%', '_'], ['\\%', '\\_'], $search);

        return $query->where(function ($q) use ($escapedSearch) {
            $q->where('name', 'like', "%{$escapedSearch}%")
                ->orWhere('address', 'like', "%{$escapedSearch}%")
                ->orWhere('region', 'like', "%{$escapedSearch}%")
                ->orWhere('city', 'like', "%{$escapedSearch}%");
        });
    }

    /**
     * Check if sales point has coordinates
     */
    public function hasCoordinates(): bool
    {
        return !is_null($this->latitude) && !is_null($this->longitude);
    }

    /**
     * Get Google Maps URL
     */
    public function getGoogleMapsUrl(): ?string
    {
        if (!$this->hasCoordinates()) {
            return null;
        }

        return "https://www.google.com/maps?q={$this->latitude},{$this->longitude}";
    }

    /**
     * Get formatted phone number for click-to-call
     */
    public function getCallablePhone(): string
    {
        return 'tel:' . preg_replace('/[^0-9+]/', '', $this->phone);
    }
}
