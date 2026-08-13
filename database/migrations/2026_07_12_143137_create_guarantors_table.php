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
        Schema::create('guarantors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained()->onDelete('cascade');
            $table->string('full_name');
            $table->string('phone_number');
            $table->string('email');
            $table->enum('employment_type', ['landowner', 'corporate_employee', 'government_official', 'business_owner']);
            $table->string('employment_details')->nullable();
            $table->string('id_type')->default('national_id'); // national_id, passport, drivers_license
            $table->string('id_number');
            $table->string('id_file_path')->nullable();
            $table->string('digital_signature')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->string('verification_reference')->nullable();
            $table->boolean('acknowledges_liability')->default(false);
            $table->timestamp('liability_acknowledged_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guarantors');
    }
};
