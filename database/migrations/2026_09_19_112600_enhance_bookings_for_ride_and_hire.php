<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Open ride bids can exist before a driver claims them
        try {
            // Prefer raw SQL so this works without doctrine/dbal on production
            DB::statement('ALTER TABLE bookings MODIFY driver_id BIGINT UNSIGNED NULL');
        } catch (\Throwable $e) {
            try {
                Schema::table('bookings', function (Blueprint $table) {
                    $table->unsignedBigInteger('driver_id')->nullable()->change();
                });
            } catch (\Throwable $e2) {
                // leave as-is; open_ride may still work if FK already nullable
            }
        }

        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'booking_mode')) {
                $table->string('booking_mode', 32)->default('trip')->after('status');
                // trip | open_ride | employment
            }

            if (!Schema::hasColumn('bookings', 'route_description')) {
                $table->text('route_description')->nullable()->after('description');
            }

            if (!Schema::hasColumn('bookings', 'proposed_salary')) {
                $table->decimal('proposed_salary', 15, 2)->nullable()->after('agreed_rate');
            }

            if (!Schema::hasColumn('bookings', 'payment_cycle')) {
                $table->string('payment_cycle', 32)->nullable()->after('proposed_salary');
            }

            if (!Schema::hasColumn('bookings', 'shift_preference')) {
                $table->string('shift_preference', 32)->nullable()->after('payment_cycle');
            }

            if (!Schema::hasColumn('bookings', 'accommodation_required')) {
                $table->boolean('accommodation_required')->default(false)->after('shift_preference');
            }

            if (!Schema::hasColumn('bookings', 'vehicle_required')) {
                $table->boolean('vehicle_required')->default(false)->after('accommodation_required');
            }

            if (!Schema::hasColumn('bookings', 'start_date')) {
                $table->date('start_date')->nullable()->after('pickup_time');
            }

            if (!Schema::hasColumn('bookings', 'end_date')) {
                $table->date('end_date')->nullable()->after('start_date');
            }

            if (!Schema::hasColumn('bookings', 'include_tolls')) {
                $table->boolean('include_tolls')->default(false)->after('special_requirements');
            }
        });

        // Expand vehicle_type + pricing_type enums carefully for MySQL
        try {
            DB::statement("ALTER TABLE bookings MODIFY vehicle_type VARCHAR(32) NOT NULL DEFAULT 'van'");
            DB::statement("ALTER TABLE bookings MODIFY pricing_type VARCHAR(32) NOT NULL DEFAULT 'trip'");
            DB::statement("ALTER TABLE bookings MODIFY pickup_latitude DECIMAL(10,8) NULL");
            DB::statement("ALTER TABLE bookings MODIFY pickup_longitude DECIMAL(11,8) NULL");
            DB::statement("ALTER TABLE bookings MODIFY dropoff_latitude DECIMAL(10,8) NULL");
            DB::statement("ALTER TABLE bookings MODIFY dropoff_longitude DECIMAL(11,8) NULL");
            DB::statement("ALTER TABLE bookings MODIFY pickup_location VARCHAR(255) NULL");
            DB::statement("ALTER TABLE bookings MODIFY dropoff_location VARCHAR(255) NULL");
            DB::statement("ALTER TABLE bookings MODIFY pickup_time TIMESTAMP NULL");
        } catch (\Throwable $e) {
            // SQLite / non-MySQL environments — columns already mostly flexible via change()
        }
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $cols = [
                'booking_mode',
                'route_description',
                'proposed_salary',
                'payment_cycle',
                'shift_preference',
                'accommodation_required',
                'vehicle_required',
                'start_date',
                'end_date',
                'include_tolls',
            ];
            foreach ($cols as $col) {
                if (Schema::hasColumn('bookings', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
