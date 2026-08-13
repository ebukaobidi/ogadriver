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
            $table->string('biometric_scan_image')->nullable()->after('pin_verified_at');
            $table->timestamp('biometric_scan_at')->nullable()->after('biometric_scan_image');
            $table->boolean('biometric_verified')->default(false)->after('biometric_scan_at');
            $table->timestamp('biometric_verified_at')->nullable()->after('biometric_verified');
            $table->text('biometric_rejection_reason')->nullable()->after('biometric_verified_at');
            $table->index('biometric_verified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['biometric_verified']);
            $table->dropColumn(['biometric_scan_image', 'biometric_scan_at', 'biometric_verified', 'biometric_verified_at', 'biometric_rejection_reason']);
        });
    }
};
