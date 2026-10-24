<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('driver_vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
            
            // Vehicle Details
            $table->string('vehicle_type')->nullable(); // e.g., Sedan, SUV, Van, Truck
            $table->string('make')->nullable();         // e.g., Toyota
            $table->string('model')->nullable();        // e.g., Corolla
            $table->string('year')->nullable();         // e.g., 2020
            $table->string('color')->nullable();
            $table->string('plate_number')->nullable()->unique();
            
            // Expected Rates
            $table->decimal('expected_daily_rate', 10, 2)->nullable();
            $table->decimal('expected_monthly_rate', 10, 2)->nullable();
            
            // Verification & Documents
            $table->string('proof_of_ownership_doc')->nullable();
            $table->string('vehicle_license_doc')->nullable();
            $table->string('roadworthiness_doc')->nullable();
            $table->string('commercial_insurance_doc')->nullable();
            
            // Expiry Dates
            $table->date('insurance_expiry_date')->nullable();
            $table->date('roadworthiness_expiry_date')->nullable();
            
            // Photos
            $table->string('front_photo')->nullable();
            $table->string('side_photo')->nullable();
            $table->string('interior_photo')->nullable();
            
            // Operational Status
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->boolean('is_active')->default(true);
            $table->text('rejection_reason')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('driver_vehicles');
    }
};
