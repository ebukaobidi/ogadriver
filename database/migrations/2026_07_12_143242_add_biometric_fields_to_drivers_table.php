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
            $table->string('nin_number')->nullable()->after('license_expiry');
            $table->string('frsc_license_number')->nullable()->after('nin_number');
            $table->boolean('biometric_verified')->default(false)->after('is_verified');
            $table->timestamp('biometric_verified_at')->nullable()->after('biometric_verified');
            $table->string('biometric_provider')->nullable()->after('biometric_verified_at'); // smile_id, verified_africa
            $table->string('biometric_reference')->nullable()->after('biometric_provider');
            $table->string('facial_scan_path')->nullable()->after('biometric_reference');
            $table->boolean('biometric_match_confirmed')->default(false)->after('facial_scan_path');
            $table->float('biometric_confidence_score')->nullable()->after('biometric_match_confirmed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn([
                'nin_number',
                'frsc_license_number',
                'biometric_verified',
                'biometric_verified_at',
                'biometric_provider',
                'biometric_reference',
                'facial_scan_path',
                'biometric_match_confirmed',
                'biometric_confidence_score',
            ]);
        });
    }
};
