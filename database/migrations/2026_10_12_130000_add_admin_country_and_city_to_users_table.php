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
            if (!Schema::hasColumn('users', 'admin_country_id')) {
                $table->foreignId('admin_country_id')->nullable()->after('admin_department')->constrained('countries')->nullOnDelete();
            }
            if (!Schema::hasColumn('users', 'admin_city_id')) {
                $table->foreignId('admin_city_id')->nullable()->after('admin_state_id')->constrained('cities')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'admin_city_id')) {
                $table->dropForeign(['admin_city_id']);
                $table->dropColumn('admin_city_id');
            }
            if (Schema::hasColumn('users', 'admin_country_id')) {
                $table->dropForeign(['admin_country_id']);
                $table->dropColumn('admin_country_id');
            }
        });
    }
};
