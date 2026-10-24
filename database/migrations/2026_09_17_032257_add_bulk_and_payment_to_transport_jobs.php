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
        Schema::table('transport_jobs', function (Blueprint $table) {
            $table->unsignedBigInteger('parent_job_id')->nullable()->after('id');
            $table->integer('required_operatives')->default(1)->after('surge_multiplier');
            $table->enum('payment_method', ['cash', 'direct_transfer', 'escrow'])->default('direct_transfer')->after('amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transport_jobs', function (Blueprint $table) {
            $table->dropColumn(['parent_job_id', 'required_operatives', 'payment_method']);
        });
    }
};
