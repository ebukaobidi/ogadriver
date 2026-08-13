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
            $table->string('device_imei')->nullable()->after('email');
            $table->string('device_fingerprint')->nullable()->after('device_imei');
            $table->string('google_account_id')->nullable()->after('device_fingerprint');
            $table->timestamp('last_device_verified_at')->nullable()->after('google_account_id');
            $table->index('device_imei');
            $table->index('device_fingerprint');
            $table->index('google_account_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['device_imei']);
            $table->dropIndex(['device_fingerprint']);
            $table->dropIndex(['google_account_id']);
            $table->dropColumn(['device_imei', 'device_fingerprint', 'google_account_id', 'last_device_verified_at']);
        });
    }
};
