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
        // 1. Instant Bank Payouts
        Schema::create('driver_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->string('bank_code', 20);
            $table->string('bank_name', 100);
            $table->string('account_number', 20);
            $table->string('account_name', 150);
            $table->string('transfer_reference')->unique();
            $table->enum('status', ['pending', 'processing', 'successful', 'failed'])->default('pending');
            $table->string('gateway', 30)->default('paystack');
            $table->text('failure_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        // 2. Emergency SOS Alerts
        Schema::create('emergency_sos_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('address')->nullable();
            $table->string('audio_clip_path')->nullable();
            $table->enum('status', ['active', 'resolved', 'false_alarm'])->default('active');
            $table->timestamp('resolved_at')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users');
            $table->json('notified_contacts')->nullable();
            $table->timestamps();
        });

        // 3. Fuel & Spare Parts Perks
        Schema::create('driver_perks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('partner_name');
            $table->string('partner_logo')->nullable();
            $table->enum('category', ['fuel', 'maintenance', 'insurance', 'tire', 'car_wash']);
            $table->decimal('discount_percentage', 5, 2)->default(5.00);
            $table->string('location_scope')->default('All Regions');
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('perk_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('perk_id')->constrained('driver_perks')->onDelete('cascade');
            $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
            $table->string('qr_token')->unique();
            $table->decimal('amount_saved', 10, 2)->default(0.00);
            $table->enum('status', ['generated', 'redeemed', 'expired'])->default('generated');
            $table->timestamp('redeemed_at')->nullable();
            $table->timestamps();
        });

        // 4. Weekly Cash Sprints & Leaderboard
        Schema::create('weekly_sprints', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('total_prize_pool', 12, 2)->default(50000.00);
            $table->integer('min_trips_required')->default(10);
            $table->decimal('min_rating_required', 3, 2)->default(4.50);
            $table->enum('status', ['upcoming', 'active', 'completed'])->default('active');
            $table->text('prizes_breakdown')->nullable();
            $table->timestamps();
        });

        Schema::create('sprint_leaderboards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sprint_id')->constrained('weekly_sprints')->onDelete('cascade');
            $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
            $table->integer('completed_jobs')->default(0);
            $table->decimal('rating_score', 3, 2)->default(5.00);
            $table->integer('points')->default(0);
            $table->integer('rank')->default(1);
            $table->decimal('prize_earned', 10, 2)->default(0.00);
            $table->boolean('prize_claimed')->default(false);
            $table->timestamps();
        });

        // 5. Document Renewal Butler
        Schema::create('document_renewals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
            $table->string('document_type'); // driver_license, lasdri_card, vehicle_inspection, police_clearance
            $table->date('expiry_date');
            $table->enum('status', ['pending', 'processing', 'completed', 'rejected'])->default('pending');
            $table->decimal('fee_amount', 10, 2)->default(0.00);
            $table->string('partner_agency')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_renewals');
        Schema::dropIfExists('sprint_leaderboards');
        Schema::dropIfExists('weekly_sprints');
        Schema::dropIfExists('perk_redemptions');
        Schema::dropIfExists('driver_perks');
        Schema::dropIfExists('emergency_sos_alerts');
        Schema::dropIfExists('driver_payouts');
    }
};
