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
        Schema::create('guarantor_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guarantor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('driver_id')->constrained()->cascadeOnDelete();
            $table->string('call_id')->nullable();
            $table->text('transcript')->nullable();
            $table->json('answers')->nullable();
            $table->integer('duration')->nullable();
            $table->integer('certification_score')->nullable();
            $table->json('analysis')->nullable();
            $table->json('location_data')->nullable();
            $table->boolean('verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guarantor_verifications');
    }
};
