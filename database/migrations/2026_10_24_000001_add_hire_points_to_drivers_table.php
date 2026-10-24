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
            if (!Schema::hasColumn('drivers', 'hire_points')) {
                $table->integer('hire_points')->default(2)->after('is_online');
            }
        });

        if (!Schema::hasTable('hire_point_transactions')) {
            Schema::create('hire_point_transactions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
                $table->enum('type', ['credit', 'debit']); // credit (purchase/grant), debit (spent on job apply/accept)
                $table->integer('points');
                $table->integer('balance_before');
                $table->integer('balance_after');
                $table->string('reason'); // 'welcome_bonus', 'wallet_purchase', 'job_apply', 'job_accept', 'admin_grant', 'refund'
                $table->unsignedBigInteger('job_id')->nullable();
                $table->decimal('cost_amount', 12, 2)->default(0.00);
                $table->string('currency', 10)->default('NGN');
                $table->timestamps();

                $table->index('driver_id');
                $table->index('type');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hire_point_transactions');
        Schema::table('drivers', function (Blueprint $table) {
            if (Schema::hasColumn('drivers', 'hire_points')) {
                $table->dropColumn('hire_points');
            }
        });
    }
};
