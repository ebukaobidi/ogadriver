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
        Schema::create('fuel_prices', function (Blueprint $table) {
            $table->id();
            $table->string('region')->default('Lagos');
            $table->string('fuel_type')->default('PMS'); // PMS (Petrol), AGO (Diesel), CNG
            $table->decimal('price_per_liter', 10, 2)->default(950.00); // Current price in NGN
            $table->string('source')->default('manual'); // manual, api
            $table->timestamp('effective_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('vehicle_costs', function (Blueprint $table) {
            $table->id();
            $table->string('vehicle_type')->unique(); // saloon, suv, van, truck, motorcycle
            $table->decimal('fuel_consumption_per_km', 8, 3)->default(0.10); // Liters per km
            $table->decimal('maintenance_cost_per_km', 10, 2)->default(25.00); // NGN per km
            $table->decimal('depreciation_cost_per_km', 10, 2)->default(15.00); // NGN per km
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_costs');
        Schema::dropIfExists('fuel_prices');
    }
};
