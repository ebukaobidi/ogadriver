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
            if (!Schema::hasColumn('drivers', 'relisting_fee_paid')) {
                $table->boolean('relisting_fee_paid')->default(false);
            }
            if (!Schema::hasColumn('drivers', 'job_status')) {
                $table->string('job_status')->default('available'); // available, hired, suspended
            }
            if (!Schema::hasColumn('drivers', 'relisting_fee_paid_at')) {
                $table->timestamp('relisting_fee_paid_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn(['relisting_fee_paid', 'job_status', 'relisting_fee_paid_at']);
        });
    }
};
