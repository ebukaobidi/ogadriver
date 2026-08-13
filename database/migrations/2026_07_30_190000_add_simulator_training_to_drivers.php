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
            // Simulator training fields
            $table->boolean('simulator_completed')->default(false)->after('biometric_verified');
            $table->integer('simulator_high_score')->default(0)->after('simulator_completed');
            $table->string('simulator_difficulty')->default('beginner')->after('simulator_high_score');
            $table->timestamp('simulator_completed_at')->nullable()->after('simulator_difficulty');
            
            // Index for simulator completion
            $table->index('simulator_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropIndex(['simulator_completed']);
            $table->dropColumn(['simulator_completed', 'simulator_high_score', 'simulator_difficulty', 'simulator_completed_at']);
        });
    }
};
