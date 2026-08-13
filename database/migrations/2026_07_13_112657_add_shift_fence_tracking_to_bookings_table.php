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
            $table->decimal('corporate_parking_latitude', 10, 8)->nullable()->after('shift_end_time');
            $table->decimal('corporate_parking_longitude', 11, 8)->nullable()->after('corporate_parking_latitude');
            $table->boolean('shift_fence_active')->default(false)->after('corporate_parking_longitude');
            $table->index(['corporate_parking_latitude', 'corporate_parking_longitude'], 'bookings_corp_parking_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex('bookings_corp_parking_idx');
            $table->dropColumn(['corporate_parking_latitude', 'corporate_parking_longitude', 'shift_fence_active']);
        });
    }
};
