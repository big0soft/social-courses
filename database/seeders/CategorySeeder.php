<?php

namespace Database\Seeders;

use App\Models\Course\CourseCategory;
use App\Models\Course\CourseCategoryChild;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $placeholder = '/assets/images/intro/default/categories/category-1.png';

        foreach ($this->gradeDefinitions() as $definition) {
            $category = CourseCategory::updateOrCreate(
                ['slug' => $definition['slug']],
                [
                    'title' => $definition['title_ar'],
                    'title_en' => $definition['title_en'],
                    'title_ar' => $definition['title_ar'],
                    'subtitle_en' => $definition['subtitle_en'],
                    'subtitle_ar' => $definition['subtitle_ar'],
                    'slug' => $definition['slug'],
                    'icon' => $definition['icon'] ?? null,
                    'sort' => $definition['sort'],
                    'status' => true,
                    'description' => $definition['description'] ?? null,
                    'thumbnail' => $definition['thumbnail'] ?? $placeholder,
                    'accent_color' => $definition['accent_color'],
                    'meta' => [
                        'number' => $definition['number'],
                        'formatted_name_en' => $definition['formatted_name_en'],
                        'formatted_name_ar' => $definition['formatted_name_ar'],
                    ] + ($definition['meta'] ?? []),
                ]
            );

            $childSlugs = [];

            foreach ($definition['children'] as $index => $child) {
                $record = CourseCategoryChild::updateOrCreate(
                    ['slug' => $child['slug']],
                    [
                        'course_category_id' => $category->id,
                        'title' => $child['title_ar'],
                        'title_en' => $child['title_en'],
                        'title_ar' => $child['title_ar'],
                        'slug' => $child['slug'],
                        'icon' => $child['icon'] ?? null,
                        'sort' => $child['sort'] ?? ($index + 1),
                        'status' => true,
                        'description' => $child['description'] ?? null,
                        'meta' => $child['meta'] ?? null,
                    ]
                );

                $childSlugs[] = $record->slug;
            }

            CourseCategoryChild::where('course_category_id', $category->id)
                ->whereNotIn('slug', $childSlugs)
                ->delete();
        }
    }

    private function gradeDefinitions(): array
    {
        $accentPalette = ['#10EDF5', '#8BE28B', '#FFD65A', '#FF9F68', '#B38CFF', '#84D8FF'];
        $grades = [];

        for ($grade = 1; $grade <= 12; $grade++) {
            $grades[] = [
                'slug' => "grade-{$grade}",
                'title_en' => "Grade {$grade}",
                'title_ar' => "الصف {$this->arabicOrdinal($grade)}",
                'formatted_name_en' => "Grade {$grade}",
                'formatted_name_ar' => $this->arabicOrdinal($grade),
                'subtitle_en' => $grade <= 10 ? 'Semester-based track' : 'Tawjihi specialization',
                'subtitle_ar' => $grade <= 10 ? 'مسار فصلي' : 'مسارات التوجيهي',
                'accent_color' => $accentPalette[($grade - 1) % count($accentPalette)],
                'sort' => $grade,
                'number' => $grade,
                'children' => $grade <= 10 ? $this->semesterChildren($grade) : $this->tawjihiTracks($grade),
            ];
        }

        return $grades;
    }

    private function semesterChildren(int $grade): array
    {
        return [
            [
                'slug' => "grade-{$grade}-semester-1",
                'title_en' => 'Semester 1',
                'title_ar' => 'الفصل الأول',
                'description' => 'First term curriculum focus',
                'meta' => ['type' => 'semester', 'semester' => 1],
            ],
            [
                'slug' => "grade-{$grade}-semester-2",
                'title_en' => 'Semester 2',
                'title_ar' => 'الفصل الثاني',
                'description' => 'Second term curriculum focus',
                'meta' => ['type' => 'semester', 'semester' => 2],
            ],
        ];
    }

    private function tawjihiTracks(int $grade): array
    {
        return [
            [
                'slug' => "grade-{$grade}-scientific",
                'title_en' => 'Scientific Stream',
                'title_ar' => 'الفرع العلمي',
                'description' => 'Mathematics, physics, chemistry, biology',
                'meta' => ['type' => 'track', 'track_code' => 'scientific'],
            ],
            [
                'slug' => "grade-{$grade}-literary",
                'title_en' => 'Literary Stream',
                'title_ar' => 'الفرع الأدبي',
                'description' => 'Humanities, history, Arabic literature',
                'meta' => ['type' => 'track', 'track_code' => 'literary'],
            ],
            [
                'slug' => "grade-{$grade}-it-industrial",
                'title_en' => 'IT & Industrial',
                'title_ar' => 'الفرع التكنولوجي والصناعي',
                'description' => 'Technology, industrial applications, applied sciences',
                'meta' => ['type' => 'track', 'track_code' => 'it_industrial'],
            ],
            [
                'slug' => "grade-{$grade}-vocational",
                'title_en' => 'Vocational',
                'title_ar' => 'الفرع المهني',
                'description' => 'Practical skills for workforce readiness',
                'meta' => ['type' => 'track', 'track_code' => 'vocational'],
            ],
        ];
    }

    private function arabicOrdinal(int $grade): string
    {
        $map = [
            1 => 'الأول',
            2 => 'الثاني',
            3 => 'الثالث',
            4 => 'الرابع',
            5 => 'الخامس',
            6 => 'السادس',
            7 => 'السابع',
            8 => 'الثامن',
            9 => 'التاسع',
            10 => 'العاشر',
            11 => 'الحادي عشر',
            12 => 'الثاني عشر',
        ];

        return $map[$grade] ?? (string) $grade;
    }
}
