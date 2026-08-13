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
        Schema::create('driver_incidents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('driver_id')->constrained()->onDelete('cascade');
            $table->foreignId('reported_by')->constrained('users')->onDelete('cascade');
            $table->enum('incident_type', ['dangerous_driving_request', 'route_deviation', 'harassment', 'extortion_threat', 'safety_violation', 'other']);
            $table->text('description');
            $table->timestamp('incident_time');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('status', ['pending', 'investigating', 'resolved', 'dismissed'])->default('pending');
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('resolution_notes')->nullable();
            $table->boolean('escrow_protected')->default(false); // Protects driver's escrow payment
            $table->json('evidence_data')->nullable(); // Telemetry data, screenshots, etc.
            $table->timestamps();
            
            $table->index('booking_id');
            $table->index('driver_id');
            $table->index('incident_type');
            $table->index('status');
            $table->index('incident_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_incidents');
    }
};
