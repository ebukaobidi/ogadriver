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
        Schema::table('transactions', function (Blueprint $table) {
            $table->enum('category', [
                'deposit',
                'withdrawal',
                'job_payment',
                'subscription',
                'verification_fee',
                'escrow',
                'payout',
                'refund'
            ])->default('deposit')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->enum('category', [
                'deposit',
                'withdrawal',
                'job_payment',
                'subscription',
                'escrow',
                'payout',
                'refund'
            ])->default('deposit')->change();
        });
    }
};
