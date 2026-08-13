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
        Schema::table('drivers', function (Blueprint $table) {
            $table->string('guarantor_a_code')->nullable();
            $table->enum('guarantor_a_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->string('guarantor_b_code')->nullable();
            $table->enum('guarantor_b_status', ['pending', 'verified', 'rejected'])->default('pending');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn([
                'guarantor_a_code', 'guarantor_a_status',
                'guarantor_b_code', 'guarantor_b_status'
            ]);
        });
    }
};
