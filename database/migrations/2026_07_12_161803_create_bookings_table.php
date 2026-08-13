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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hirer_id')->constrained()->onDelete('cascade');
            $table->foreignId('driver_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('vehicle_type', ['heavy_duty', 'light_truck', 'van', 'bus', 'tanker']);
            $table->string('pickup_location');
            $table->decimal('pickup_latitude', 10, 8);
            $table->decimal('pickup_longitude', 11, 8);
            $table->string('dropoff_location');
            $table->decimal('dropoff_latitude', 10, 8);
            $table->decimal('dropoff_longitude', 11, 8);
            $table->timestamp('pickup_time');
            $table->timestamp('estimated_completion_time')->nullable();
            $table->decimal('distance_km', 8, 2)->nullable();
            $table->decimal('agreed_rate', 15, 2);
            $table->enum('pricing_type', ['hourly', 'daily', 'trip', 'distance'])->default('trip');
            $table->decimal('estimated_duration_hours', 8, 2)->nullable();
            $table->enum('status', ['pending', 'accepted', 'funded', 'in_progress', 'completed', 'cancelled', 'disputed'])->default('pending');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('funded_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->string('security_pin', 4)->nullable(); // Dynamic 4-digit PIN for driver verification
            $table->timestamp('pin_generated_at')->nullable();
            $table->timestamp('pin_verified_at')->nullable();
            $table->json('special_requirements')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('hirer_id');
            $table->index('driver_id');
            $table->index('status');
            $table->index('pickup_time');
            $table->index(['pickup_latitude', 'pickup_longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
