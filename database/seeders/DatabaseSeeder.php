<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Blog\Database\Seeders\BlogDatabaseSeeder;
use Modules\Language\Database\Seeders\LanguageDatabaseSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SettingsSeeder::class,
            UserSeeder::class,
            NavbarSeeder::class,
            FooterSeeder::class,
            CategorySeeder::class,
            PageSeeder::class,
            AdSeeder::class,
            BlogDatabaseSeeder::class,
            LanguageDatabaseSeeder::class,
        ]);
    }
}
