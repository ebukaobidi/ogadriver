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
        Schema::create('blacklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('entity_type'); // 'driver', 'hirer', 'device', 'google_account', 'nin'
            $table->string('entity_identifier'); // IMEI, Google ID, NIN, etc.
            $table->string('reason');
            $table->enum('severity', ['warning', 'temporary', 'permanent'])->default('permanent');
            $table->timestamp('banned_at')->nullable();
            $table->timestamp('banned_until')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('banned_by')->nullable()->constrained('users')->onDelete('set null');
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('entity_type');
            $table->index('entity_identifier');
            $table->index('banned_at');
            $table->unique(['entity_type', 'entity_identifier']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blacklists');
    }
};
