<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ad extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'tagline',
        'image',
        'cta_label',
        'cta_url',
        'is_active',
        'display_order',
        'starts_at',
        'ends_at',
    ];

    protected $casts = [
        'is_active' => 'bool',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        $now = now();

        return $query
            ->where('is_active', true)
            ->where(function ($builder) use ($now) {
                /** @var \Illuminate\Database\Eloquent\Builder $builder */
                $builder->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($builder) use ($now) {
                /** @var \Illuminate\Database\Eloquent\Builder $builder */
                $builder->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            });
    }

    public function isCurrentlyActive(): bool
    {
        $now = now();
        $starts = $this->starts_at instanceof CarbonInterface ? $this->starts_at : now();
        $ends = $this->ends_at instanceof CarbonInterface ? $this->ends_at : null;

        $startsOk = $starts ? $starts->lte($now) : true;
        $endsOk = $ends ? $ends->gte($now) : true;

        return $this->is_active && $startsOk && $endsOk;
    }
}

