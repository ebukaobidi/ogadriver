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
        Schema::create('location_certifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained()->cascadeOnDelete();
            $table->boolean('address_verified')->default(false);
            $table->boolean('geo_match')->default(false);
            $table->string('residence_stability')->nullable();
            $table->integer('location_risk_score')->nullable();
            $table->integer('service_area_coverage')->nullable();
            $table->string('certification_level')->nullable();
            $table->json('recommendations')->nullable();
            $table->timestamp('certified_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('location_certifications');
    }
};
