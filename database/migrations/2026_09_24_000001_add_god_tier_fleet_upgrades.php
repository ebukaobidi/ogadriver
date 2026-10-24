<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('driver_vehicles', function (Blueprint $table) {
            // 1. Hardware Kill Switch API
            $table->string('gps_tracker_api_url')->nullable()->comment('Webhook URL to physically kill engine');
            $table->string('gps_tracker_api_key')->nullable()->comment('Auth key for the hardware tracker');

            // 2. Predictive Maintenance
            $table->decimal('maintenance_interval_km', 8, 2)->default(5000.00)->comment('Kilometers until next service');
            $table->decimal('current_mileage_km', 10, 2)->default(0.00)->comment('Total KM driven on platform');
            $table->boolean('maintenance_alert_sent')->default(false);

            // 3. Maintenance Escrow
            $table->decimal('escrow_weekly_deduction', 10, 2)->default(0.00)->comment('Amount deducted weekly for repairs');
            $table->decimal('escrow_balance', 12, 2)->default(0.00)->comment('Total funds currently held for repairs');
        });
    }

    public function down()
    {
        Schema::table('driver_vehicles', function (Blueprint $table) {
            $table->dropColumn([
                'gps_tracker_api_url',
                'gps_tracker_api_key',
                'maintenance_interval_km',
                'current_mileage_km',
                'maintenance_alert_sent',
                'escrow_weekly_deduction',
                'escrow_balance'
            ]);
        });
    }
};
