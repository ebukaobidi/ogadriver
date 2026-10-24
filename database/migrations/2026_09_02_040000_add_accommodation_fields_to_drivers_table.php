<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            // Add accommodation fields if they do not already exist
            if (!Schema::hasColumn('drivers', 'accommodation_needed')) {
                $table->boolean('accommodation_needed')->default(false)->after('some_existing_column');
            }
            if (!Schema::hasColumn('drivers', 'accommodation_notes')) {
                $table->text('accommodation_notes')->nullable()->after('accommodation_needed');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn(['accommodation_needed', 'accommodation_notes']);
        });
    }
};
?>
