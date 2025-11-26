<?php

namespace Database\Seeders;

use App\Models\Ad;
use Illuminate\Database\Seeder;

class AdSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ads = [
            [
                'title' => 'Unlock STEM Excellence',
                'tagline' => 'Advanced Robotics & AI bootcamps for Grades 8-12',
                'image' => '/assets/images/intro/home-1/hero-image.png',
                'cta_label' => 'Join the Bootcamp',
                'cta_url' => '/courses/details/stem-bootcamp/1',
                'display_order' => 1,
            ],
            [
                'title' => 'Creative Writing Labs',
                'tagline' => 'Guided storytelling journeys that build confidence.',
                'image' => '/assets/images/intro/home-2/hero-image.png',
                'cta_label' => 'View Cohorts',
                'cta_url' => '/courses/details/creative-writing/2',
                'display_order' => 2,
            ],
            [
                'title' => 'SAT Accelerator',
                'tagline' => 'Elite tutors, adaptive mock tests, proven outcomes.',
                'image' => '/assets/images/intro/home-3/hero-image.png',
                'cta_label' => 'Start Planning',
                'cta_url' => '/courses/details/sat-accelerator/3',
                'display_order' => 3,
            ],
        ];

        foreach ($ads as $ad) {
            Ad::updateOrCreate(
                ['title' => $ad['title']],
                array_merge($ad, [
                    'is_active' => true,
                    'starts_at' => now()->subDays(2),
                    'ends_at' => now()->addMonth(),
                ])
            );
        }
    }
}

