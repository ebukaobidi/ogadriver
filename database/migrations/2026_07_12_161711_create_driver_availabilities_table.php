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
        Schema::create('driver_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->enum('status', ['available', 'booked', 'unavailable'])->default('available');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->unique(['driver_id', 'date']);
            $table->index('driver_id');
            $table->index('date');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_availabilities');
    }
};
