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
        Schema::table('prepaid_cards', function (Blueprint $table) {
            $table->foreignId('sales_point_id')->nullable()->after('created_by')->constrained()->onDelete('set null');
            $table->foreignId('sales_point_purchase_id')->nullable()->after('sales_point_id')->constrained()->onDelete('set null');
            $table->timestamp('sold_to_sales_point_at')->nullable()->after('sales_point_purchase_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prepaid_cards', function (Blueprint $table) {
            $table->dropForeign(['sales_point_id']);
            $table->dropForeign(['sales_point_purchase_id']);
            $table->dropColumn(['sales_point_id', 'sales_point_purchase_id', 'sold_to_sales_point_at']);
        });
    }
};
