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
            $table->timestamp('trial_started_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->boolean('is_on_trial')->default(false);
            $table->boolean('is_listed')->default(false);
            $table->timestamp('listed_at')->nullable();
            $table->timestamp('delisted_at')->nullable();
            $table->string('delisted_reason')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn([
                'trial_started_at',
                'trial_ends_at',
                'is_on_trial',
                'is_listed',
                'listed_at',
                'delisted_at',
                'delisted_reason'
            ]);
        });
    }
};
