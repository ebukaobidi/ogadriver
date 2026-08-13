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
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('transport_jobs')->onDelete('cascade');
            $table->foreignId('raised_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('against_user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['no_show', 'late_arrival', 'damage', 'payment', 'behavior', 'other']);
            $table->text('description');
            $table->enum('status', ['open', 'under_review', 'resolved', 'escalated'])->default('open');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null'); // Admin assigned
            $table->decimal('penalty_amount', 15, 2)->nullable();
            $table->string('penalty_currency', 3)->default('NGN');
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->json('evidence')->nullable(); // File paths, screenshots
            $table->timestamps();
            
            $table->index('job_id');
            $table->index('raised_by');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
