<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('promoter_id')->nullable();
            $table->unsignedBigInteger('territory_id')->nullable();
            $table->string('promoter_tier')->nullable();
            $table->decimal('promoter_commission_rate', 5, 2)->default(10.00);
        });

        Schema::table('drivers', function (Blueprint $table) {
            $table->unsignedBigInteger('regional_manager_id')->nullable();
        });

        Schema::create('territories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('country_code', 3);
            $table->unsignedBigInteger('manager_id')->nullable();
            $table->decimal('manager_override_rate', 5, 2)->default(2.50);
            $table->timestamps();
            
            $table->foreign('manager_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('promoter_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('territory_id')->references('id')->on('territories')->onDelete('set null');
        });

        Schema::table('drivers', function (Blueprint $table) {
            $table->foreign('regional_manager_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropForeign(['regional_manager_id']);
            $table->dropColumn('regional_manager_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['promoter_id']);
            $table->dropForeign(['territory_id']);
            $table->dropColumn(['promoter_id', 'territory_id', 'promoter_tier', 'promoter_commission_rate']);
        });

        Schema::dropIfExists('territories');
    }
};
