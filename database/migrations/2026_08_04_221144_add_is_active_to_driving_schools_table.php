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
            if (!Schema::hasColumn('driving_schools', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('logo_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('driving_schools', function (Blueprint $table) {
            if (Schema::hasColumn('driving_schools', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });
    }
};
