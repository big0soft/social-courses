<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $page = DB::table('pages')->where('slug', 'home-alpha')->first();

        if (!$page) {
            return;
        }

        DB::table('pages')
            ->where('id', $page->id)
            ->update([
                'name' => 'Prime Landing',
                'slug' => 'home-prime',
                'type' => 'collaborative',
                'title' => 'Prime Landing - Personalized Learning Pathways',
                'description' => 'A modern tutoring marketplace with adaptive cohorts for every grade.',
                'meta_description' => 'Prime pairs students with elite tutors, immersive cohorts, and measurable outcomes across every grade level.',
                'meta_keywords' => 'prime, tutoring, cohorts, personalized learning, grade tutoring, adaptive learning',
            ]);

        $slugMap = [
            'alpha_stats' => 'prime_stats',
            'grade_tracks' => 'prime_grades',
            'alpha_tutors' => 'prime_tutors',
            'alpha_testimonials' => 'prime_testimonials',
            'alpha_cta' => 'prime_cta',
        ];

        foreach ($slugMap as $old => $new) {
            DB::table('page_sections')
                ->where('page_id', $page->id)
                ->where('slug', $old)
                ->update(['slug' => $new]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $page = DB::table('pages')->where('slug', 'home-prime')->first();

        if (!$page) {
            return;
        }

        DB::table('pages')
            ->where('id', $page->id)
            ->update([
                'name' => 'Alpha Platform',
                'slug' => 'home-alpha',
                'type' => 'administrative',
                'title' => 'Alpha Platform - Personalized Learning Pathways',
                'description' => 'A modern tutoring marketplace with adaptive cohorts for every grade.',
                'meta_description' => 'Alpha pairs students with elite tutors, immersive cohorts, and measurable outcomes across every grade level.',
                'meta_keywords' => 'alpha, tutoring, cohorts, personalized learning, grade tutoring, adaptive learning',
            ]);

        $slugMap = [
            'prime_stats' => 'alpha_stats',
            'prime_grades' => 'grade_tracks',
            'prime_tutors' => 'alpha_tutors',
            'prime_testimonials' => 'alpha_testimonials',
            'prime_cta' => 'alpha_cta',
        ];

        foreach ($slugMap as $old => $new) {
            DB::table('page_sections')
                ->where('page_id', $page->id)
                ->where('slug', $old)
                ->update(['slug' => $new]);
        }
    }
};

