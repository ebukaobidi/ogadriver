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
        Schema::create('driving_telemetry', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('driver_id')->constrained()->onDelete('cascade');
            $table->timestamp('recorded_at');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('speed_kmh', 6, 2)->nullable();
            $table->decimal('acceleration_x', 8, 4)->nullable(); // G-force X axis
            $table->decimal('acceleration_y', 8, 4)->nullable(); // G-force Y axis
            $table->decimal('acceleration_z', 8, 4)->nullable(); // G-force Z axis
            $table->boolean('hard_braking')->default(false);
            $table->boolean('aggressive_cornering')->default(false);
            $table->boolean('speeding')->default(false);
            $table->decimal('culture_score', 5, 2)->nullable(); // Instant culture score
            $table->json('sensor_data')->nullable(); // Additional sensor readings
            $table->timestamps();
            
            $table->index('booking_id');
            $table->index('driver_id');
            $table->index('recorded_at');
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driving_telemetry');
    }
};
