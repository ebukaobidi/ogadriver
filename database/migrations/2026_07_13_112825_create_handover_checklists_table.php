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
        Schema::create('handover_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('driver_id')->constrained()->onDelete('cascade');
            $table->foreignId('hirer_id')->constrained()->onDelete('cascade');
            
            // Vehicle condition checks
            $table->boolean('tyres_condition_ok')->default(false);
            $table->boolean('fuel_level_recorded')->default(false);
            $table->boolean('warning_lights_check')->default(false);
            $table->boolean('brakes_functional')->default(false);
            $table->boolean('lights_functional')->default(false);
            $table->boolean('mirrors_adjusted')->default(false);
            $table->boolean('seatbelts_functional')->default(false);
            $table->boolean('windshield_wipers_ok')->default(false);
            $table->boolean('vehicle_documents_valid')->default(false);
            
            // Fuel level percentage
            $table->integer('fuel_level_percentage')->nullable();
            
            // Vehicle condition notes
            $table->text('condition_notes')->nullable();
            
            // Document validity flags
            $table->boolean('vehicle_papers_valid')->default(true);
            $table->boolean('insurance_valid')->default(true);
            $table->boolean('road_worthiness_valid')->default(true);
            
            // Waiver required if documents invalid
            $table->boolean('waiver_required')->default(false);
            $table->boolean('waiver_signed_by_hirer')->default(false);
            $table->timestamp('waiver_signed_at')->nullable();
            $table->text('waiver_reason')->nullable();
            
            // Photo evidence
            $table->json('photo_evidence')->nullable(); // Array of image paths
            
            // Timestamps
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            
            // Status
            $table->enum('status', ['pending', 'in_progress', 'completed', 'waiver_required', 'waiver_signed'])->default('pending');
            
            $table->timestamps();
            
            $table->index('booking_id');
            $table->index('driver_id');
            $table->index('hirer_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('handover_checklists');
    }
};
