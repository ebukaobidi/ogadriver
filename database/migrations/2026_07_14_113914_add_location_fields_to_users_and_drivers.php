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
            if (!Schema::hasColumn('users', 'country_id')) {
                $table->foreignId('country_id')->nullable()->constrained()->onDelete('set null');
            } else {
                $table->foreign('country_id')->references('id')->on('countries')->onDelete('set null');
            }
        });

        Schema::table('drivers', function (Blueprint $table) {
            if (!Schema::hasColumn('drivers', 'state_id')) {
                $table->foreignId('state_id')->nullable()->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('drivers', 'city_id')) {
                $table->foreignId('city_id')->nullable()->constrained()->onDelete('set null');
            }
            if (!Schema::hasColumn('drivers', 'police_clearance_url')) {
                $table->string('police_clearance_url')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropForeign(['state_id']);
            $table->dropForeign(['city_id']);
            $table->dropColumn(['state_id', 'city_id', 'police_clearance_url']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['country_id']);
            $table->dropColumn('country_id');
        });
    }
};
