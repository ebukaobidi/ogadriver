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
        Schema::create('regions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g. Lagos, Abuja, Port Harcourt, Accra, Nairobi
            $table->string('country_code', 2)->default('NG');
            $table->string('currency_code', 3)->default('NGN');
            $table->string('currency_symbol', 5)->default('₦');
            $table->decimal('base_rate_per_km', 10, 2)->default(250.00);
            $table->decimal('base_rate_per_minute', 10, 2)->default(30.00);
            $table->decimal('minimum_fare', 10, 2)->default(1000.00);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('regions');
    }
};
