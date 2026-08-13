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
        Schema::table('guarantors', function (Blueprint $table) {
            $table->timestamp('last_renewal_check')->nullable()->after('verified_at');
            $table->boolean('renewal_confirmed')->default(false)->after('last_renewal_check');
            $table->timestamp('renewal_confirmed_at')->nullable()->after('renewal_confirmed');
            $table->index('last_renewal_check');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guarantors', function (Blueprint $table) {
            $table->dropIndex(['last_renewal_check']);
            $table->dropColumn(['last_renewal_check', 'renewal_confirmed', 'renewal_confirmed_at']);
        });
    }
};
