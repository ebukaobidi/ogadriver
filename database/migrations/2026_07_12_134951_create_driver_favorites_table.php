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
        Schema::create('driver_favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hirer_id')->constrained()->onDelete('cascade');
            $table->foreignId('driver_id')->constrained()->onDelete('cascade');
            $table->string('notes')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();
            
            $table->index('hirer_id');
            $table->index('driver_id');
            $table->unique(['hirer_id', 'driver_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_favorites');
    }
};
