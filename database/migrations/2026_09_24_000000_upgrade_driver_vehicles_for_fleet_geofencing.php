<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('driver_vehicles', function (Blueprint $table) {
            $table->foreignId('fleet_owner_id')->nullable()->constrained('users')->onDelete('set null')->after('driver_id')->comment('The actual owner of the vehicle if not the driver');
            
            // Security & Geofencing
            $table->decimal('geofence_center_lat', 10, 8)->nullable();
            $table->decimal('geofence_center_lng', 11, 8)->nullable();
            $table->integer('geofence_radius_km')->nullable()->comment('Max distance from center allowed');
            $table->time('curfew_start')->nullable()->comment('When the car must be parked (e.g. 22:00)');
            $table->time('curfew_end')->nullable()->comment('When curfew lifts (e.g. 05:00)');
            
            // Financial Split
            $table->decimal('driver_revenue_share_percent', 5, 2)->default(100.00)->comment('Percentage of earnings driver keeps. Rest goes to fleet owner');
        });

        Schema::create('fleet_vehicle_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained('driver_vehicles')->onDelete('cascade');
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('driver_id')->nullable()->constrained('drivers')->onDelete('set null');
            $table->string('status')->default('pending')->comment('pending, active, revoked, reported_stolen');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('fleet_vehicle_assignments');
        Schema::table('driver_vehicles', function (Blueprint $table) {
            $table->dropForeign(['fleet_owner_id']);
            $table->dropColumn([
                'fleet_owner_id', 
                'geofence_center_lat', 
                'geofence_center_lng', 
                'geofence_radius_km', 
                'curfew_start', 
                'curfew_end',
                'driver_revenue_share_percent'
            ]);
        });
    }
};
