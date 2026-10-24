<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: create_driver_guarantor_bonds_table
 *
 * - Creates the `driver_guarantor_bonds` table (if it does not already exist).
 * - Adds corporate‑safe and fidelity‑coverage columns to `driver_profiles`.
 *
 * This guard (`Schema::hasTable`) allows the migration to be re‑run safely on
 * production environments where the table may already have been created manually
 * or by a previous failed migration attempt.
 */
class CreateDriverGuarantorBondsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // ------------------------------------------------------------
        // 1. Create driver_guarantor_bonds only if the table is missing
        // ------------------------------------------------------------
        if (!Schema::hasTable('driver_guarantor_bonds')) {
            Schema::create('driver_guarantor_bonds', function (Blueprint $table) {
                $table->id();
                $table->foreignId('driver_id')
                      ->constrained('users')
                      ->onDelete('cascade');
                $table->string('guarantor_name');
                $table->string('guarantor_nin');
                $table->string('guarantor_phone');
                $table->string('guarantor_email');
                $table->string('relationship');

                // Legal Bond Verification Parameters
                $table->boolean('indemnity_signed')->default(false);
                $table->timestamp('signed_at')->nullable();
                $table->string('signature_ip')->nullable();
                $table->enum('verification_status', ['pending', 'verified', 'rejected'])
                      ->default('pending');

                $table->timestamps();
            });
        }

        // ------------------------------------------------------------
        // 2. Extend driver_profiles with the new corporate‑safe fields
        // ------------------------------------------------------------
        // The driver_profiles table should already exist (it is created by
        // another migration). If it does not, this block will throw an error –
        // which is desirable because the schema would be inconsistent.
        Schema::table('driver_profiles', function (Blueprint $table) {
            // Only add the column if it does not already exist – this avoids
            // duplicate‑column errors when the migration is re‑run.
            if (!Schema::hasColumn('driver_profiles', 'is_corporate_safe')) {
                $table->boolean('is_corporate_safe')
                      ->default(false)
                      ->after('is_active');
            }
            if (!Schema::hasColumn('driver_profiles', 'fidelity_coverage_amount')) {
                $table->decimal('fidelity_coverage_amount', 12, 2)
                      ->default(0.00)
                      ->after('is_corporate_safe');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the table only if it exists – safe for repeated rollbacks.
        Schema::dropIfExists('driver_guarantor_bonds');

        // Remove the added columns from driver_profiles if they exist.
        Schema::table('driver_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('driver_profiles', 'is_corporate_safe')) {
                $table->dropColumn('is_corporate_safe');
            }
            if (Schema::hasColumn('driver_profiles', 'fidelity_coverage_amount')) {
                $table->dropColumn('fidelity_coverage_amount');
            }
        });
    }
}
