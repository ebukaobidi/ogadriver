<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            if (!Schema::hasColumn('drivers', 'biometric_login')) {
                $table->boolean('biometric_login')->default(false);
            }
            if (!Schema::hasColumn('drivers', 'available_for_interstate')) {
                $table->boolean('available_for_interstate')->default(false);
            }
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn([
                'biometric_login',
                'available_for_interstate',
            ]);
        });
    }
};
