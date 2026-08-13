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
        Schema::create('pre_drive_handover_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->string('tyre_condition');
            $table->integer('fuel_level_percent');
            $table->string('dashboard_warnings')->nullable();
            $table->timestamp('driver_signed_at')->nullable();
            $table->timestamp('employer_verified_at')->nullable();
            $table->json('vehicle_photos')->nullable();
            $table->timestamps();
            
            $table->index('booking_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pre_drive_handover_checklists');
    }
};
