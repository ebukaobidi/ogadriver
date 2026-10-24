<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('driver_id')->constrained()->cascadeOnDelete();
            $table->foreignId('placement_id')->nullable()->constrained('jobs')->nullOnDelete();
            $table->json('checklist'); // e.g., {"oil_level": "good", "tires": "worn"}
            $table->json('photos')->nullable();
            $table->string('status')->default('submitted'); // submitted, approved, flagged
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_inspections');
    }
};
