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
        Schema::create('offline_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('sync_id')->unique()->comment('UUID from mobile device to prevent duplicate syncs');
            $table->json('payload')->comment('The original booking request payload');
            $table->string('status')->default('pending')->comment('pending, synced, failed');
            $table->text('error_message')->nullable();
            $table->foreignId('resulting_booking_id')->nullable()->comment('Linked booking ID after successful sync');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offline_bookings');
    }
};
