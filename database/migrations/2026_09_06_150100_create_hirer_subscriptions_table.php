<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('hirer_subscriptions')) {
            Schema::create('hirer_subscriptions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('hirer_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('vehicle_id')->constrained('driver_vehicles')->onDelete('cascade');
                $table->decimal('monthly_fee', 10, 2);
                $table->timestamp('active_until')->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('hirer_subscriptions', function (Blueprint $table) {
                if (!Schema::hasColumn('hirer_subscriptions', 'hirer_id')) {
                    $table->foreignId('hirer_id')->constrained('users')->onDelete('cascade');
                }
                
                if (!Schema::hasColumn('hirer_subscriptions', 'vehicle_id')) {
                    $table->foreignId('vehicle_id')->constrained('driver_vehicles')->onDelete('cascade');
                }

                if (!Schema::hasColumn('hirer_subscriptions', 'monthly_fee')) {
                    $table->decimal('monthly_fee', 10, 2);
                }

                if (!Schema::hasColumn('hirer_subscriptions', 'active_until')) {
                    $table->timestamp('active_until')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hirer_subscriptions');
    }
};
