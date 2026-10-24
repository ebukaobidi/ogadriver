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
        Schema::table('drivers', function (Blueprint $table) {
            $table->boolean('destination_mode_active')->default(false)->after('is_online');
            $table->string('destination_label')->nullable()->after('destination_mode_active');
            $table->string('destination_address')->nullable()->after('destination_label');
            $table->decimal('destination_latitude', 10, 7)->nullable()->after('destination_address');
            $table->decimal('destination_longitude', 10, 7)->nullable()->after('destination_latitude');
            $table->decimal('destination_max_detour_km', 5, 2)->default(5.00)->after('destination_longitude');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn([
                'destination_mode_active',
                'destination_label',
                'destination_address',
                'destination_latitude',
                'destination_longitude',
                'destination_max_detour_km'
            ]);
        });
    }
};
