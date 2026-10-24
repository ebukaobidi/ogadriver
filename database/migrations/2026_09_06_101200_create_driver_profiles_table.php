<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: create_driver_profiles_table
 *
 * Creates the `driver_profiles` table which stores per‑driver profile information.
 * This table is required before the `driver_guarantor_bonds` migration can add
 * additional columns (`is_corporate_safe` and `fidelity_coverage_amount`).
 */
class CreateDriverProfilesTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Only create if the table does not already exist – safe for production.
        if (!Schema::hasTable('driver_profiles')) {
            Schema::create('driver_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')
                      ->constrained('users')
                      ->onDelete('cascade');
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driver_profiles');
    }
}
?>
