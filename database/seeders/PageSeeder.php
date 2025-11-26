<?php

namespace Database\Seeders;

use App\Models\Page;
use App\Models\PageSection;
use App\Models\Setting;
use Database\Data\PageData;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class PageSeeder extends Seeder
{
   /**
    * Run the database seeds.
    */
   public function run(): void
   {
      // Get page data from organized data class
      $pagesData = PageData::getAllPages();
      
      if (!$pagesData || empty($pagesData)) {
         return;
      }

      $defaultPage = null;

      // First create or update the pages
      foreach ($pagesData as $pageData) {
         // Use firstOrCreate to avoid duplicates
         $page = Page::firstOrCreate(
            ['slug' => $pageData['slug']],
            Arr::except($pageData, ['sections'])
         );

         // Update the page if it already exists to ensure data is current
         if ($page->wasRecentlyCreated === false) {
            $page->update(Arr::except($pageData, ['sections']));
         }

         // Store the first home page as default (or home-prime if it exists)
         if (!$defaultPage) {
            $defaultPage = $page;
         }
         if ($page->slug === 'home-prime') {
            $defaultPage = $page;
         }

         // Delete existing sections for this page to avoid duplicates
         PageSection::where('page_id', $page->id)->delete();

         // Then create all sections for this page
         foreach ($pageData['sections'] as $section) {
            // Add the page ID to each section
            $section['page_id'] = $page->id;

            // Create the section
            PageSection::create($section);
         }
      }

      // Set default home page setting (create or update)
      if ($defaultPage) {
         Setting::updateOrCreate(
            ['type' => 'home_page'],
            [
               'sub_type' => null,
               'title' => 'Select Home Page',
               'fields' => [
                  'page_id' => $defaultPage->id,
                  'page_name' => $defaultPage->name,
                  'page_slug' => $defaultPage->slug,
               ],
            ]
         );
      }
   }
}
