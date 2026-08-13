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
            if (!Schema::hasColumn('driving_schools', 'facilities')) {
                $table->json('facilities')->nullable();
            }
            if (!Schema::hasColumn('driving_schools', 'is_verified')) {
                $table->boolean('is_verified')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('driving_schools', function (Blueprint $table) {
            if (Schema::hasColumn('driving_schools', 'facilities')) {
                $table->dropColumn('facilities');
            }
            if (Schema::hasColumn('driving_schools', 'is_verified')) {
                $table->dropColumn('is_verified');
            }
        });
    }
};
