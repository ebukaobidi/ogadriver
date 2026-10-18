<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Driver;
use App\Models\HirerProfile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

header('Content-Type: text/plain');

try {
    // 1. Driver Account: cejmartict@gmail.com / 3b88WAra
    $driverUser = User::updateOrCreate(
        ['email' => 'cejmartict@gmail.com'],
        [
            'name' => 'Martict Driver',
            'phone' => '+2348012345678',
            'password' => Hash::make('3b88WAra'),
            'role' => 'driver',
            'user_type' => 'driver',
            'is_verified' => 1,
            'email_verified_at' => now(),
        ]
    );

    // Update driver profile columns that exist
    DB::table('drivers')->where('user_id', $driverUser->id)->update([
        'is_online' => 1,
        'license_number' => 'LS1234567890',
    ]);

    echo "DRIVER ACCOUNT SET UP SUCCESS: cejmartict@gmail.com / 3b88WAra\n";

    // 2. Hirer Accounts: ikengaumuigbo@gmail.com & ikeneumuigbo@gmail.com / 3b88WAra
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
                'email_verified_at' => now(),
            ]
        );

        HirerProfile::updateOrCreate(
            ['user_id' => $hirerUser->id],
            [
                'company_name' => 'Ikenga Enterprises',
            ]
        );

        echo "HIRER ACCOUNT SET UP SUCCESS: {$email} / 3b88WAra\n";
    }

    echo "\n=== ALL TEST ACCOUNTS FULLY CONFIGURED & READY FOR LOCALHOST TESTING ===";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}
