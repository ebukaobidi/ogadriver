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
                if (!Schema::hasColumn('driver_vehicles', 'ownership_type')) {
                    $table->enum('ownership_type', ['personal', 'employer', 'rental_hp'])
                        ->default('personal')
                        ->after('plate_number')
                        ->comment('personal: driver owns car; employer: vehicle belongs to hirer; rental_hp: rental/hire-purchase');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('driver_vehicles') && Schema::hasColumn('driver_vehicles', 'ownership_type')) {
            Schema::table('driver_vehicles', function (Blueprint $table) {
                $table->dropColumn('ownership_type');
            });
        }
    }
};
