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
        Schema::create('ondemand_rides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rider_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->onDelete('set null');
            $table->enum('status', ['requested', 'driver_assigned', 'driver_enroute', 'started', 'completed', 'cancelled', 'no_driver_available'])->default('requested');
            
            // Pickup details
            $table->string('pickup_address');
            $table->decimal('pickup_latitude', 10, 8);
            $table->decimal('pickup_longitude', 11, 8);
            $table->timestamp('requested_at');
            $table->timestamp('driver_assigned_at')->nullable();
            $table->timestamp('driver_arrived_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            
            // Dropoff details
            $table->string('dropoff_address');
            $table->decimal('dropoff_latitude', 10, 8);
            $table->decimal('dropoff_longitude', 11, 8);
            
            // Route and pricing
            $table->decimal('estimated_distance_km', 8, 2);
            $table->decimal('estimated_duration_minutes', 8, 2);
            $table->decimal('actual_distance_km', 8, 2)->nullable();
            $table->decimal('actual_duration_minutes', 8, 2)->nullable();
            $table->decimal('fare_amount', 10, 2);
            $table->string('currency', 3)->default('NGN');
            $table->boolean('is_surge_pricing')->default(false);
            $table->decimal('surge_multiplier', 3, 2)->default(1.0);
            
            // Ride preferences
            $table->string('vehicle_type_preference')->nullable();
            $table->json('ride_preferences')->nullable();
            
            // Driver info shown before acceptance
            $table->boolean('driver_details_shown')->default(false);
            $table->timestamp('driver_details_shown_at')->nullable();
            
            // Cancellation
            $table->enum('cancelled_by', ['rider', 'driver', 'system', 'admin'])->nullable();
            $table->text('cancellation_reason')->nullable();
            
            // Payment
            $table->enum('payment_method', ['cash', 'wallet', 'card'])->default('cash');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->onDelete('set null');
            
            // Ratings
            $table->decimal('rider_rating', 2, 1)->nullable();
            $table->text('rider_review')->nullable();
            $table->decimal('driver_rating', 2, 1)->nullable();
            $table->text('driver_review')->nullable();
            
            // Safety
            $table->boolean('emergency_triggered')->default(false);
            $table->timestamp('emergency_triggered_at')->nullable();
            $table->text('emergency_reason')->nullable();
            
            // Metadata
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['status', 'created_at']);
            $table->index(['driver_id', 'status']);
            $table->index(['rider_id', 'created_at']);
            $table->index('pickup_latitude');
            $table->index('pickup_longitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ondemand_rides');
    }
};
