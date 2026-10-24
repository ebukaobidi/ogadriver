<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            if (!Schema::hasColumn('drivers', 'has_vehicle')) {
                $table->boolean('has_vehicle')->default(false);
            }
            if (!Schema::hasColumn('drivers', 'service_mode')) {
                $table->enum('service_mode', ['driver_only', 'driver_with_vehicle', 'both'])->default('driver_only');
            }
            if (!Schema::hasColumn('drivers', 'simulator_score')) {
                $table->integer('simulator_score')->nullable();
            }
            if (!Schema::hasColumn('drivers', 'simulator_rating_badge')) {
                $table->string('simulator_rating_badge')->nullable();
            }
            if (!Schema::hasColumn('drivers', 'telemetry_enabled')) {
                $table->boolean('telemetry_enabled')->default(true);
            }
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn(['has_vehicle', 'service_mode', 'simulator_score', 'simulator_rating_badge', 'telemetry_enabled']);
        });
    }
};
?>
