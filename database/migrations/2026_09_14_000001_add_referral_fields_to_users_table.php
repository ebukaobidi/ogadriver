<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // unique referral code for each user
            $table->string('referral_code', 12)->unique()->nullable();
            // reference to the user who referred this user
            $table->unsignedBigInteger('referred_by_user_id')->nullable();
            $table->foreign('referred_by_user_id')->references('id')->on('users')->onDelete('set null');
            // balances for referral rewards (in naira)
            $table->unsignedInteger('referral_balance')->default(0);
            $table->unsignedInteger('referral_pending_balance')->default(0);
            $table->boolean('referral_rewarded')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['referred_by_user_id']);
            $table->dropColumn([
                'referral_code',
                'referred_by_user_id',
                'referral_balance',
                'referral_pending_balance',
                'referral_rewarded',
            ]);
        });
    }
};
