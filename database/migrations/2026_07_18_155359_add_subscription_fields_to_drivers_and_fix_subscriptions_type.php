<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            if (!Schema::hasColumn('drivers', 'subscription_tier')) {
                $table->string('subscription_tier')->nullable()->after('status');
            }
            if (!Schema::hasColumn('drivers', 'subscription_expires_at')) {
                $table->timestamp('subscription_expires_at')->nullable()->after('subscription_tier');
            }
        });

        // Plan names (e.g. "Standard Operative") do not fit the old enum.
        // Convert to a flexible string so subscribe/status APIs can store plan names.
        if (Schema::hasTable('subscriptions')) {
            $driver = Schema::getConnection()->getDriverName();

            if ($driver === 'mysql') {
                DB::statement("ALTER TABLE subscriptions MODIFY type VARCHAR(100) NOT NULL");
            } else {
                Schema::table('subscriptions', function (Blueprint $table) {
                    $table->string('type', 100)->change();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            if (Schema::hasColumn('drivers', 'subscription_expires_at')) {
                $table->dropColumn('subscription_expires_at');
            }
            if (Schema::hasColumn('drivers', 'subscription_tier')) {
                $table->dropColumn('subscription_tier');
            }
        });

        if (Schema::hasTable('subscriptions')) {
            $driver = Schema::getConnection()->getDriverName();

            if ($driver === 'mysql') {
                DB::statement("ALTER TABLE subscriptions MODIFY type ENUM('driver_pro','corporate','enterprise') NOT NULL");
            }
        }
    }
};
