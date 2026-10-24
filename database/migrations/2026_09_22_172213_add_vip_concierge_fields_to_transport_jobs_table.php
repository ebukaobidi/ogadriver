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
            $table->boolean('is_vip_convoy')->default(false)->after('status');
            $table->boolean('requires_cpo')->default(false)->after('is_vip_convoy');
            $table->boolean('requires_police_escort')->default(false)->after('requires_cpo');
            $table->boolean('stealth_mode')->default(false)->after('requires_police_escort');
            $table->timestamp('nda_signed_at')->nullable()->after('stealth_mode');
            $table->json('convoy_vehicle_ids')->nullable()->after('nda_signed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transport_jobs', function (Blueprint $table) {
            $table->dropColumn([
                'is_vip_convoy',
                'requires_cpo',
                'requires_police_escort',
                'stealth_mode',
                'nda_signed_at',
                'convoy_vehicle_ids'
            ]);
        });
    }
};
