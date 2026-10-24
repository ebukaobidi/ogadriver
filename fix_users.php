<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Driver;
use App\Models\HirerProfile;
use Illuminate\Support\Facades\Hash;

try {
    // 1. Driver Account
    $driverUser = User::updateOrCreate(
        ['email' => 'cejmartict@gmail.com'],
        [
            'name' => 'Martict Driver',
            'phone' => '+2348012345678',
            'password' => Hash::make('3b88WAra'),
            'role' => 'driver',
            'user_type' => 'driver',
            'is_verified' => 1,
            'status' => 'active',
            'email_verified_at' => now(),
        ]
    );

    Driver::updateOrCreate(
        ['user_id' => $driverUser->id],
        [
            'alias' => 'Martict',
            'is_online' => 1,
            'nin_verified' => 1,
            'license_number' => 'LS1234567890',
            'status' => 'approved',
        ]
    );

    echo "Driver account set up: cejmartict@gmail.com / 3b88WAra\n";

    // 2. Hirer Accounts (both spellings)
    $hirerEmails = ['ikengaumuigbo@gmail.com', 'ikeneumuigbo@gmail.com'];
    foreach ($hirerEmails as $email) {
        $hirerUser = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Ikenga Hirer',
                'phone' => '+2348087654321',
                'password' => Hash::make('3b88WAra'),
                'role' => 'hirer',
                'user_type' => 'hirer',
                'is_verified' => 1,
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        HirerProfile::updateOrCreate(
            ['user_id' => $hirerUser->id],
            [
                'company_name' => 'Ikenga Enterprises',
            ]
        );

        echo "Hirer account set up: {$email} / 3b88WAra\n";
    }

    echo "ALL TEST USERS SUCCESSFULLY CREATED / UPDATED IN LOCAL DATABASE.\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}
