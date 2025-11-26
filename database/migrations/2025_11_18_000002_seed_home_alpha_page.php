<?php

use App\Enums\TeachingType;
use App\Models\Page;
use App\Models\PageSection;
use Database\Data\Sections\IntroSections;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Page::where('slug', 'home-prime')->exists()) {
            return;
        }

        DB::transaction(function () {
            $page = Page::create([
                'name' => 'Prime Landing',
                'slug' => 'home-prime',
                'type' => TeachingType::COLLABORATIVE->value,
                'title' => 'Prime Landing - Personalized Learning Pathways',
                'description' => 'A modern tutoring marketplace with adaptive cohorts for every grade.',
                'meta_description' => 'Prime pairs students with elite tutors, immersive cohorts, and measurable outcomes across every grade level.',
                'meta_keywords' => 'prime, tutoring, cohorts, personalized learning, grade tutoring, adaptive learning',
                'active' => true,
                'sort' => 0,
            ]);

            $sections = IntroSections::getHomePrimeSections();

            foreach ($sections as $section) {
                PageSection::create([
                    ...$section,
                    'page_id' => $page->id,
                ]);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $page = Page::where('slug', 'home-prime')->first();

        if ($page) {
            PageSection::where('page_id', $page->id)->delete();
            $page->delete();
        }
    }
};

