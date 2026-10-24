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
        Schema::create('mobile_configs', function (Blueprint $table) {
            $table->id();
            $table->boolean('force_update')->default(false);
            $table->boolean('maintenance_mode')->default(false);
            $table->string('min_version')->default('1.0.0');
            $table->string('latest_version')->default('1.0.0');
            $table->text('maintenance_message')->nullable();
            $table->text('force_update_message')->nullable();
            $table->timestamps();
        });
        
        // Seed default config
        \Illuminate\Support\Facades\DB::table('mobile_configs')->insert([
            'force_update' => false,
            'maintenance_mode' => false,
            'min_version' => '1.0.0',
            'latest_version' => '1.0.0',
            'maintenance_message' => 'System is under maintenance. Please check back shortly.',
            'force_update_message' => 'Please update to the latest version to continue.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mobile_configs');
    }
};
