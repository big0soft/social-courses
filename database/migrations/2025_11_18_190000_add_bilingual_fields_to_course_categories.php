<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_categories', function (Blueprint $table) {
            $table->string('title_en')->nullable()->after('title');
            $table->string('title_ar')->nullable()->after('title_en');
            $table->string('subtitle_en')->nullable()->after('description');
            $table->string('subtitle_ar')->nullable()->after('subtitle_en');
            $table->string('accent_color', 20)->nullable()->after('thumbnail');
            $table->json('meta')->nullable()->after('accent_color');
        });

        Schema::table('course_category_children', function (Blueprint $table) {
            $table->string('title_en')->nullable()->after('title');
            $table->string('title_ar')->nullable()->after('title_en');
            $table->json('meta')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('course_categories', function (Blueprint $table) {
            $table->dropColumn([
                'title_en',
                'title_ar',
                'subtitle_en',
                'subtitle_ar',
                'accent_color',
                'meta',
            ]);
        });

        Schema::table('course_category_children', function (Blueprint $table) {
            $table->dropColumn([
                'title_en',
                'title_ar',
                'meta',
            ]);
        });
    }
};

