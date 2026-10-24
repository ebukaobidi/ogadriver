<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('hirers') && Schema::hasColumn('hirers', 'verification_status')) {
            try {
                DB::statement("ALTER TABLE hirers MODIFY COLUMN verification_status ENUM('unverified', 'pending', 'verified', 'rejected') DEFAULT 'pending'");
            } catch (\Throwable $e) {
                // Ignore if driver/platform doesn't support alter enum statement directly
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('hirers') && Schema::hasColumn('hirers', 'verification_status')) {
            try {
                DB::statement("ALTER TABLE hirers MODIFY COLUMN verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending'");
            } catch (\Throwable $e) {
                // Ignore
            }
        }
    }
};
