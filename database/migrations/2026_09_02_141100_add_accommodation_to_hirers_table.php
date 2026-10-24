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
        Schema::table('hirers', function (Blueprint $table) {
            $table->enum('accommodation_preference', ['with_accommodation', 'without_accommodation', 'flexible'])->default('flexible')->after('verification_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hirers', function (Blueprint $table) {
            $table->dropColumn('accommodation_preference');
        });
    }
};
