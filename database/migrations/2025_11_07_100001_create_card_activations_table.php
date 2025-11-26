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
        Schema::create('card_activations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prepaid_card_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Audit trail
            $table->string('ip_address', 45)->nullable(); // Support IPv4 and IPv6
            $table->text('user_agent')->nullable();
            $table->timestamp('activated_at')->useCurrent();

            // Courses enrolled (for bundle cards, this tracks which courses were activated)
            $table->json('courses_enrolled')->nullable(); // Array of course IDs

            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('prepaid_card_id');
            $table->index('activated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_activations');
    }
};
