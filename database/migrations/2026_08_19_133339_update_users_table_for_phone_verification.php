<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Clean up any null/empty phone numbers or duplicates before altering
        $users = DB::table('users')->get();
        $seenPhones = [];
        
        foreach ($users as $user) {
            $phone = trim($user->phone ?? '');
            if (empty($phone)) {
                // If phone is empty, generate a unique dummy phone number
                $dummyPhone = '+23480' . str_pad($user->id, 8, '0', STR_PAD_LEFT);
                DB::table('users')->where('id', $user->id)->update(['phone' => $dummyPhone]);
                $seenPhones[$dummyPhone] = true;
            } else {
                if (isset($seenPhones[$phone])) {
                    // Duplicate phone number, append ID to make it unique
                    $uniquePhone = $phone . '_' . $user->id;
                    DB::table('users')->where('id', $user->id)->update(['phone' => $uniquePhone]);
                    $seenPhones[$uniquePhone] = true;
                } else {
                    $seenPhones[$phone] = true;
                }
            }
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable(false)->change();
            $table->unique('phone');
            $table->timestamp('phone_verified_at')->nullable()->after('email_verified_at');
            $table->string('verification_code')->nullable()->after('phone_verified_at');
            $table->timestamp('verification_expires_at')->nullable()->after('verification_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['phone']);
            $table->string('phone')->nullable()->change();
            $table->dropColumn(['phone_verified_at', 'verification_code', 'verification_expires_at']);
        });
    }
};
