<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Language\Models\Language;
use Modules\Language\Models\LanguageProperty;

class LanguageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This seeder ensures a default language exists with all required properties
     * to fix the "Attempt to read property 'properties' on null" error.
     */
    public function run(): void
    {
        $groups = [
            'auth' => require storage_path('app/lang/groups/auth.php'),
            'button' => require storage_path('app/lang/groups/button.php'),
            'common' => require storage_path('app/lang/groups/common.php'),
            'dashboard' => require storage_path('app/lang/groups/dashboard.php'),
            'frontend' => require storage_path('app/lang/groups/frontend.php'),
            'input' => require storage_path('app/lang/groups/input.php'),
            'table' => require storage_path('app/lang/groups/table.php'),
            'settings' => require storage_path('app/lang/groups/settings.php'),
        ];

        // Ensure default English language exists
        $language = Language::firstOrCreate(
            ['code' => 'en'],
            [
                'name' => 'English',
                'nativeName' => 'English',
                'flag' => null,
                'direction' => 'ltr',
                'is_active' => true,
                'is_default' => true,
            ]
        );

        // Update existing language to ensure it's default if no other default exists
        if (!Language::where('is_default', true)->where('id', '!=', $language->id)->exists()) {
            $language->update(['is_default' => true, 'is_active' => true]);
        }

        // Ensure all properties exist for this language
        // Use both slug AND language_id to ensure uniqueness per language
        foreach ($groups as $key => $group) {
            foreach ($group as $value) {
                LanguageProperty::firstOrCreate(
                    [
                        'slug' => $value['slug'],
                        'language_id' => $language->id,
                    ],
                    [
                        'name' => $value['name'],
                        'properties' => $value['properties'] ?? [],
                        'group' => $key,
                    ]
                );
            }
        }
    }
}

