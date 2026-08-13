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
            $table->string('identity_image')->nullable()->after('identity_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hirers', function (Blueprint $table) {
            $table->dropColumn('identity_image');
        });
    }
};
