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
            // Add indexes for trial-related fields to improve query performance
            $table->index('is_on_trial');
            $table->index('is_listed');
            $table->index('trial_started_at');
            $table->index('trial_ends_at');
            $table->index('listed_at');
            $table->index('delisted_at');
            
            // Composite index for finding active trial drivers
            $table->index(['is_on_trial', 'is_listed', 'trial_ends_at'], 'trial_active_index');
            
            // Composite index for finding drivers to delist
            $table->index(['is_on_trial', 'trial_ends_at'], 'trial_expiry_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropIndex(['is_on_trial']);
            $table->dropIndex(['is_listed']);
            $table->dropIndex(['trial_started_at']);
            $table->dropIndex(['trial_ends_at']);
            $table->dropIndex(['listed_at']);
            $table->dropIndex(['delisted_at']);
            $table->dropIndex('trial_active_index');
            $table->dropIndex('trial_expiry_index');
        });
    }
};
