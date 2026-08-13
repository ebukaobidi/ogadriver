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
        Schema::create('hirers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company_name');
            $table->string('company_registration_number')->nullable();
            $table->text('company_address');
            $table->string('industry')->nullable(); // FMCG, Logistics, Tech, etc.
            $table->enum('subscription_tier', ['free', 'corporate', 'enterprise'])->default('free');
            $table->integer('max_concurrent_contracts')->default(5);
            $table->boolean('can_view_direct_contacts')->default(false);
            $table->boolean('can_bulk_broadcast')->default(false);
            $table->boolean('has_api_access')->default(false);
            $table->string('api_key')->nullable()->unique();
            $table->timestamp('subscription_expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('subscription_tier');
            $table->index('company_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hirers');
    }
};
