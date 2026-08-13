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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->onDelete('cascade');
            $table->foreignId('job_id')->nullable()->constrained()->onDelete('set null');
            $table->string('type'); // credit, debit, escrow_hold, escrow_release, penalty, refund
            $table->string('category'); // job_payment, subscription, withdrawal, deposit, penalty, commission
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->text('description')->nullable();
            $table->string('reference')->unique();
            $table->enum('status', ['pending', 'completed', 'failed', 'reversed'])->default('pending');
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('wallet_id');
            $table->index('type');
            $table->index('status');
            $table->index('reference');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
