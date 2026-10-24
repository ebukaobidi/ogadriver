<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('drivers')) {
            Schema::table('drivers', function (Blueprint $table) {
                if (!Schema::hasColumn('drivers', 'boost_tier')) {
                    $table->string('boost_tier')->nullable()->after('subscription_expires_at');
                }
                if (!Schema::hasColumn('drivers', 'boost_multiplier')) {
                    $table->string('boost_multiplier')->nullable()->after('boost_tier');
                }
                if (!Schema::hasColumn('drivers', 'boosted_until')) {
                    $table->dateTime('boosted_until')->nullable()->after('boost_multiplier');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('drivers')) {
            Schema::table('drivers', function (Blueprint $table) {
                if (Schema::hasColumn('drivers', 'boost_tier')) {
                    $table->dropColumn(['boost_tier', 'boost_multiplier', 'boosted_until']);
                }
            });
        }
    }
};
