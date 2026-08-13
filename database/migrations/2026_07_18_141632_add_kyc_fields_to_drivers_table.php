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
            $table->string('nin')->nullable();
            $table->string('bvn')->nullable();
            $table->text('residence_address')->nullable();
            
            $table->string('guarantor_a_name')->nullable();
            $table->string('guarantor_a_phone')->nullable();
            $table->text('guarantor_a_address')->nullable();
            $table->string('guarantor_a_occupation')->nullable();
            $table->string('guarantor_a_company')->nullable();

            $table->string('guarantor_b_name')->nullable();
            $table->string('guarantor_b_phone')->nullable();
            $table->text('guarantor_b_address')->nullable();
            $table->string('guarantor_b_occupation')->nullable();
            $table->string('guarantor_b_company')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn([
                'nin', 'bvn', 'residence_address',
                'guarantor_a_name', 'guarantor_a_phone', 'guarantor_a_address', 'guarantor_a_occupation', 'guarantor_a_company',
                'guarantor_b_name', 'guarantor_b_phone', 'guarantor_b_address', 'guarantor_b_occupation', 'guarantor_b_company'
            ]);
        });
    }
};
