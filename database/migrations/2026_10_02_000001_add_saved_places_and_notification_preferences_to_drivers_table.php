<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            if (!Schema::hasColumn('drivers', 'saved_places')) {
                $table->json('saved_places')->nullable();
            }
            if (!Schema::hasColumn('drivers', 'notification_preferences')) {
                $table->json('notification_preferences')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('drivers', 'saved_places')) {
                $columns[] = 'saved_places';
            }
            if (Schema::hasColumn('drivers', 'notification_preferences')) {
                $columns[] = 'notification_preferences';
            }
            if ($columns) {
                $table->dropColumn($columns);
            }
        });
    }
};
