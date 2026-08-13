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
        Schema::create('transport_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hirer_id')->constrained()->onDelete('cascade');
            $table->foreignId('driver_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title');
            $table->text('description');
            $table->enum('vehicle_type', ['heavy_duty', 'light_truck', 'van', 'bus', 'tanker']);
            $table->enum('job_type', ['local', 'interstate'])->default('local');
            $table->boolean('is_interstate')->default(false);
            $table->json('required_certifications')->nullable(); // Hazardous Materials, etc.
            $table->string('pickup_location');
            $table->decimal('pickup_latitude', 10, 8);
            $table->decimal('pickup_longitude', 11, 8);
            $table->string('dropoff_location');
            $table->decimal('dropoff_latitude', 10, 8);
            $table->decimal('dropoff_longitude', 11, 8);
            $table->timestamp('pickup_time');
            $table->timestamp('estimated_delivery_time')->nullable();
            $table->decimal('distance_km', 8, 2)->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('NGN');
            $table->boolean('is_surge_pricing')->default(false);
            $table->decimal('surge_multiplier', 3, 2)->default(1.00);
            $table->enum('status', ['draft', 'published', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed'])->default('draft');
            $table->boolean('is_early_access')->default(false); // For Pro drivers
            $table->timestamp('early_access_expires_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('search_radius_km')->default(50);
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('hirer_id');
            $table->index('driver_id');
            $table->index('status');
            $table->index('pickup_time');
            $table->index(['pickup_latitude', 'pickup_longitude']);
            $table->index('is_early_access');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transport_jobs');
    }
};
