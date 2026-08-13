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
        Schema::create('drivers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('license_number')->unique();
            $table->string('license_class'); // Class A, B, C, etc.
            $table->date('license_expiry');
            $table->integer('years_of_experience')->default(0);
            $table->decimal('rating', 3, 2)->default(0.00); // 0.00 to 5.00
            $table->integer('total_jobs')->default(0);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_online')->default(false);
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->string('preferred_route_type')->nullable(); // long_haul, short_haul, both
            $table->decimal('current_latitude', 10, 8)->nullable();
            $table->decimal('current_longitude', 11, 8)->nullable();
            $table->timestamp('last_location_update')->nullable();
            $table->json('vehicle_certifications')->nullable(); // Heavy Duty, Hazardous Materials, etc.
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['current_latitude', 'current_longitude']);
            $table->index('is_online');
            $table->index('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};
