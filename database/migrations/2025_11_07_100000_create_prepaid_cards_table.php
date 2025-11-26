<?php

use App\Enums\CardStatus;
use App\Enums\CardType;
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
        Schema::create('prepaid_cards', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique()->index();
            $table->string('card_type')->default(CardType::SINGLE_COURSE);
            $table->string('title')->nullable(); // Bundle name or card title
            $table->text('description')->nullable(); // Bundle description

            // Pricing
            $table->decimal('price', 10, 2);
            $table->string('currency', 3)->default('USD');

            // Single course card
            $table->foreignId('course_id')->nullable()->constrained()->onDelete('cascade');

            // Status and usage tracking
            $table->string('status')->default(CardStatus::ACTIVE);
            $table->foreignId('used_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('used_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            // Metadata
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->string('batch_id')->nullable()->index(); // For bulk generation tracking
            $table->text('notes')->nullable(); // Admin notes

            $table->timestamps();

            // Indexes for performance
            $table->index('status');
            $table->index('card_type');
            $table->index(['status', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prepaid_cards');
    }
};
