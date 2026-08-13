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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('mock_location_detected')->default(false)->after('last_device_verified_at');
            $table->boolean('root_jailbreak_detected')->default(false)->after('mock_location_detected');
            $table->boolean('gps_spoofing_detected')->default(false)->after('root_jailbreak_detected');
            $table->timestamp('last_security_scan_at')->nullable()->after('gps_spoofing_detected');
            $table->text('security_notes')->nullable()->after('last_security_scan_at');
            $table->index('mock_location_detected');
            $table->index('root_jailbreak_detected');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['mock_location_detected']);
            $table->dropIndex(['root_jailbreak_detected']);
            $table->dropColumn(['mock_location_detected', 'root_jailbreak_detected', 'gps_spoofing_detected', 'last_security_scan_at', 'security_notes']);
        });
    }
};
