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
        Schema::table('bookings', function (Blueprint $table) {
            $table->timestamp('last_telemetry_received_at')->nullable()->after('telemetry_channel_terminated_at');
            $table->boolean('blackout_alert_sent')->default(false)->after('last_telemetry_received_at');
            $table->timestamp('blackout_alert_sent_at')->nullable()->after('blackout_alert_sent');
            $table->boolean('sms_failover_active')->default(false)->after('blackout_alert_sent_at');
            $table->timestamp('sms_failover_activated_at')->nullable()->after('sms_failover_active');
            $table->integer('blackout_duration_minutes')->default(0)->after('sms_failover_activated_at');
            $table->index('last_telemetry_received_at');
            $table->index('blackout_alert_sent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['last_telemetry_received_at']);
            $table->dropIndex(['blackout_alert_sent']);
            $table->dropColumn(['last_telemetry_received_at', 'blackout_alert_sent', 'blackout_alert_sent_at', 'sms_failover_active', 'sms_failover_activated_at', 'blackout_duration_minutes']);
        });
    }
};
