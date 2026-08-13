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
        Schema::table('driver_documents', function (Blueprint $table) {
            // Change enum to string to allow more flexibility
            $table->string('document_type', 50)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('driver_documents', function (Blueprint $table) {
            // Revert back to enum with original values
            $table->enum('document_type', ['drivers_license', 'medical_certificate', 'police_clearance', 'insurance', 'vehicle_registration'])->change();
        });
    }
};
