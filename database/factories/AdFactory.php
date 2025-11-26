<?php

namespace Database\Factories;

use App\Models\Ad;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ad>
 */
class AdFactory extends Factory
{
    protected $model = Ad::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->catchPhrase(),
            'tagline' => $this->faker->sentence(8),
            'image' => '/assets/images/ads/ad-' . $this->faker->numberBetween(1, 3) . '.jpg',
            'cta_label' => 'Learn More',
            'cta_url' => '#',
            'is_active' => true,
            'display_order' => $this->faker->numberBetween(1, 10),
            'starts_at' => now()->subDays(5),
            'ends_at' => now()->addDays(30),
        ];
    }
}

