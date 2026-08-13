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
        Schema::table('driving_schools', function (Blueprint $table) {
            $table->json('images')->nullable();
            $table->json('videos')->nullable();
        });

        Schema::table('executive_car_hires', function (Blueprint $table) {
            $table->json('images')->nullable();
            $table->json('videos')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('driving_schools', function (Blueprint $table) {
            $table->dropColumn(['images', 'videos']);
        });

        Schema::table('executive_car_hires', function (Blueprint $table) {
            $table->dropColumn(['images', 'videos']);
        });
    }
};
