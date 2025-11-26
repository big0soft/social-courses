<?php

namespace App\Models\Course;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class CourseCategory extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $fillable = [
        'title',
        'title_en',
        'title_ar',
        'subtitle_en',
        'subtitle_ar',
        'slug',
        'icon',
        'sort',
        'status',
        'description',
        'thumbnail',
        'accent_color',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function courses()
    {
        return $this->hasMany(Course::class);
    }

    public function category_children()
    {
        return $this->hasMany(CourseCategoryChild::class);
    }
}
