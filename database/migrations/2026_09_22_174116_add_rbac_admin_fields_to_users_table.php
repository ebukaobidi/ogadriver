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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'admin_department')) {
                $table->enum('admin_department', ['super', 'treasury', 'regional', 'support', 'none'])->default('none')->after('role_id');
            }
            if (!Schema::hasColumn('users', 'admin_state_id')) {
                $table->foreignId('admin_state_id')->nullable()->after('admin_department')->constrained('states')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'admin_state_id')) {
                $table->dropForeign(['admin_state_id']);
                $table->dropColumn('admin_state_id');
            }
            if (Schema::hasColumn('users', 'admin_department')) {
                $table->dropColumn('admin_department');
            }
        });
    }
};
