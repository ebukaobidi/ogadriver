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
            $table->enum('contract_type', ['hourly', 'daily', 'monthly', 'yearly'])->default('hourly')->after('status');
            $table->time('shift_start_time')->nullable()->after('contract_type');
            $table->time('shift_end_time')->nullable()->after('shift_start_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['contract_type', 'shift_start_time', 'shift_end_time']);
        });
    }
};
