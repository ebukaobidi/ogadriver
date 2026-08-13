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
        Schema::create('driver_pricings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained()->onDelete('cascade');
            $table->enum('pricing_type', ['hourly', 'daily', 'trip', 'distance'])->default('trip');
            $table->decimal('base_rate', 10, 2);
            $table->decimal('minimum_rate', 10, 2)->nullable();
            $table->enum('vehicle_type', ['heavy_duty', 'light_truck', 'van', 'bus', 'tanker']);
            $table->json('rate_tiers')->nullable(); // For distance-based pricing
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index('driver_id');
            $table->index('vehicle_type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_pricings');
    }
};
