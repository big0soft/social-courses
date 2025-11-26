<?php

namespace App\Models\Course;

use App\Models\Course\SectionLesson;
use Illuminate\Database\Eloquent\Model;

class LessonResource extends Model
{
    protected $fillable = [
        'title',
        'type',
        'resource',
        'section_lesson_id',
    ];

    public function lesson()
    {
        return $this->belongsTo(SectionLesson::class);
    }
}
