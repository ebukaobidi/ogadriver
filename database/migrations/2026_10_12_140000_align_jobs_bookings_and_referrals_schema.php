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
        // 1. Ensure creator and affiliate roles exist in roles table
        $existingRoles = DB::table('roles')->pluck('slug')->toArray();
        if (!in_array('creator', $existingRoles, true)) {
            DB::table('roles')->insert([
                'name' => 'Content Creator / Promoter',
                'slug' => 'creator',
                'description' => 'Content creator and growth affiliate promoter',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        if (!in_array('affiliate', $existingRoles, true)) {
            DB::table('roles')->insert([
                'name' => 'Affiliate Partner',
                'slug' => 'affiliate',
                'description' => 'Affiliate growth and referral partner',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Upgrade transport_jobs table
        Schema::table('transport_jobs', function (Blueprint $table) {
            // Using DB raw to alter enum to varchar safely across MySQL versions
            if (DB::getDriverName() === 'mysql') {
                DB::statement("ALTER TABLE transport_jobs MODIFY COLUMN vehicle_type VARCHAR(60) NOT NULL DEFAULT 'van'");
                DB::statement("ALTER TABLE transport_jobs MODIFY COLUMN payment_method VARCHAR(32) NOT NULL DEFAULT 'direct_transfer'");
            }

            if (!Schema::hasColumn('transport_jobs', 'vacancy_type')) {
                $table->string('vacancy_type', 50)->nullable()->after('job_type');
            }
            if (!Schema::hasColumn('transport_jobs', 'prefill_driver_id')) {
                $table->foreignId('prefill_driver_id')->nullable()->after('driver_id')->constrained('drivers')->nullOnDelete();
            }
            if (!Schema::hasColumn('transport_jobs', 'stops')) {
                $table->longText('stops')->nullable()->after('dropoff_longitude');
            }
        });

        // 3. Upgrade bookings table
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'stops')) {
                $table->longText('stops')->nullable()->after('dropoff_longitude');
            }
            if (!Schema::hasColumn('bookings', 'payment_method')) {
                $table->string('payment_method', 32)->default('escrow')->after('agreed_rate');
            }
            if (!Schema::hasColumn('bookings', 'offer_price')) {
                $table->decimal('offer_price', 15, 2)->nullable()->after('agreed_rate');
            }
            if (!Schema::hasColumn('bookings', 'suggested_price')) {
                $table->decimal('suggested_price', 15, 2)->nullable()->after('offer_price');
            }
            if (!Schema::hasColumn('bookings', 'counter_offer_price')) {
                $table->decimal('counter_offer_price', 15, 2)->nullable()->after('suggested_price');
            }
            if (!Schema::hasColumn('bookings', 'negotiation_status')) {
                $table->string('negotiation_status', 32)->default('none')->after('counter_offer_price');
            }
        });

        // 4. Upgrade ondemand_rides table
        Schema::table('ondemand_rides', function (Blueprint $table) {
            if (!Schema::hasColumn('ondemand_rides', 'stops')) {
                $table->longText('stops')->nullable()->after('dropoff_longitude');
            }
            if (!Schema::hasColumn('ondemand_rides', 'offer_price')) {
                $table->decimal('offer_price', 15, 2)->nullable()->after('fare_amount');
            }
            if (!Schema::hasColumn('ondemand_rides', 'counter_offer_price')) {
                $table->decimal('counter_offer_price', 15, 2)->nullable()->after('offer_price');
            }
            if (!Schema::hasColumn('ondemand_rides', 'negotiation_status')) {
                $table->string('negotiation_status', 32)->default('none')->after('counter_offer_price');
            }
        });

        // 5. Create dedicated referrals ledger table if not exists
        if (!Schema::hasTable('referrals')) {
            Schema::create('referrals', function (Blueprint $table) {
                $table->id();
                $table->foreignId('referrer_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('referred_id')->constrained('users')->cascadeOnDelete();
                $table->string('referrer_role', 32)->default('driver'); // driver, hirer, creator, affiliate
                $table->string('referred_role', 32)->default('rider');  // driver, hirer, rider
                $table->string('status', 32)->default('pending');      // pending, qualified, rewarded, paid
                $table->decimal('reward_amount', 15, 2)->default(0.00);
                $table->timestamp('rewarded_at')->nullable();
                $table->text('notes')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();

                $table->index(['referrer_id', 'status']);
                $table->index(['referred_id']);
                $table->unique(['referrer_id', 'referred_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');

        Schema::table('ondemand_rides', function (Blueprint $table) {
            $table->dropColumn(['stops', 'offer_price', 'counter_offer_price', 'negotiation_status']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'stops',
                'payment_method',
                'offer_price',
                'suggested_price',
                'counter_offer_price',
                'negotiation_status'
            ]);
        });

        Schema::table('transport_jobs', function (Blueprint $table) {
            $table->dropForeign(['prefill_driver_id']);
            $table->dropColumn(['vacancy_type', 'prefill_driver_id', 'stops']);
        });
    }
};
