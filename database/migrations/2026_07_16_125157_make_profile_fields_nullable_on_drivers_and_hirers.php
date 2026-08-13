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
            $table->string('license_number')->nullable()->change();
            $table->string('license_class')->nullable()->change();
            $table->date('license_expiry')->nullable()->change();
        });

        Schema::table('hirers', function (Blueprint $table) {
            $table->string('company_name')->nullable()->change();
            $table->text('company_address')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // To be safe, we won't strictly enforce NO NULL on rollback if they already have nulls.
    }
};
