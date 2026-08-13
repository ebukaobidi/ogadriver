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
            $table->string('telemetry_channel_token')->nullable()->after('biometric_rejection_reason');
            $table->timestamp('telemetry_channel_established_at')->nullable()->after('telemetry_channel_token');
            $table->timestamp('telemetry_channel_terminated_at')->nullable()->after('telemetry_channel_established_at');
            $table->string('telemetry_channel_signature')->nullable()->after('telemetry_channel_terminated_at');
            $table->index('telemetry_channel_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['telemetry_channel_token']);
            $table->dropColumn(['telemetry_channel_token', 'telemetry_channel_established_at', 'telemetry_channel_terminated_at', 'telemetry_channel_signature']);
        });
    }
};
