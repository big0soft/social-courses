<?php

namespace App\Models\Course;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourseCategoryChild extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_en',
        'title_ar',
        'slug',
        'icon',
        'sort',
        'status',
        'description',
        'meta',
        'course_category_id'
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function course_category()
    {
        return $this->belongsTo(CourseCategory::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
