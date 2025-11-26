<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sales_points', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('address');
            $table->string('region')->nullable(); // For filtering (e.g., Baghdad, Basra, etc.)
            $table->string('city')->nullable();
            $table->string('country')->default('Iraq');

            // Geolocation for Google Maps
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Contact information
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('website')->nullable();

            // Additional info
            $table->text('description')->nullable();
            $table->string('image')->nullable(); // Store photo

            // Admin approval system
            $table->string('status')->default('approved'); // approved, disabled
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable(); // Admin notes

            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('region');
            $table->index('city');
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_points');
    }
};
