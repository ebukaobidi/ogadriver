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
        Schema::create('activated_locations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('state_id')->index();
            $table->unsignedBigInteger('city_id')->nullable()->index();
            $table->string('name')->comment('City or State name');
            $table->boolean('is_ride_active')->default(false)->comment('Activated for Ride Bids / Instant Trips');
            $table->boolean('is_hire_active')->default(false)->comment('Activated for Driver Hire / Employment');
            $table->integer('ride_driver_count')->default(0)->comment('Verified drivers with cars');
            $table->integer('hire_driver_count')->default(0)->comment('Verified drivers for hire');
            $table->integer('min_threshold')->default(10)->comment('Minimum required drivers to auto-activate');
            $table->boolean('manual_override')->default(false);
            $table->timestamps();

            $table->unique(['state_id', 'city_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activated_locations');
    }
};
