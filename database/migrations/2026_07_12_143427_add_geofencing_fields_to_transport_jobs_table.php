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
        Schema::table('transport_jobs', function (Blueprint $table) {
            $table->json('route_waypoints')->nullable()->after('dropoff_longitude');
            $table->decimal('max_deviation_km', 8, 2)->default(5.0)->after('route_waypoints');
            $table->boolean('geofencing_active')->default(true)->after('max_deviation_km');
            $table->boolean('deviation_alert_triggered')->default(false)->after('geofencing_active');
            $table->timestamp('deviation_alerted_at')->nullable()->after('deviation_alert_triggered');
            $table->json('last_known_location')->nullable()->after('deviation_alerted_at');
            $table->timestamp('last_location_update')->nullable()->after('last_known_location');
            $table->integer('gps_blackout_minutes')->default(0)->after('last_location_update');
            $table->boolean('blackout_alert_triggered')->default(false)->after('gps_blackout_minutes');
            $table->timestamp('blackout_alerted_at')->nullable()->after('blackout_alert_triggered');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transport_jobs', function (Blueprint $table) {
            $table->dropColumn([
                'route_waypoints',
                'max_deviation_km',
                'geofencing_active',
                'deviation_alert_triggered',
                'deviation_alerted_at',
                'last_known_location',
                'last_location_update',
                'gps_blackout_minutes',
                'blackout_alert_triggered',
                'blackout_alerted_at',
            ]);
        });
    }
};
