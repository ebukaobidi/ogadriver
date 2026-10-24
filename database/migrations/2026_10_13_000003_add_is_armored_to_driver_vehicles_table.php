<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('driver_vehicles')) {
            Schema::table('driver_vehicles', function (Blueprint $table) {
                if (!Schema::hasColumn('driver_vehicles', 'is_armored')) {
                    $table->boolean('is_armored')->default(false)->after('vehicle_type')->comment('B6/B7 Ballistic Armored Protection');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('driver_vehicles') && Schema::hasColumn('driver_vehicles', 'is_armored')) {
            Schema::table('driver_vehicles', function (Blueprint $table) {
                $table->dropColumn('is_armored');
            });
        }
    }
};
