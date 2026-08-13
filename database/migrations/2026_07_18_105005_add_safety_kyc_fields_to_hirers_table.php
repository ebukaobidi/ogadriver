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
        Schema::table('hirers', function (Blueprint $table) {
            $table->string('identity_type')->nullable();
            $table->string('identity_number')->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hirers', function (Blueprint $table) {
            $table->dropColumn([
                'identity_type',
                'identity_number',
                'emergency_contact_name',
                'emergency_contact_phone',
                'verification_status'
            ]);
        });
    }
};
