<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$password = '3b88WAra';

// Update Driver Account
$driverUser = User::where('email', 'cejmartict@gmail.com')->first();
if ($driverUser) {
    $driverUser->password = Hash::make($password);
    $driverUser->is_active = 1;
    $driverUser->email_verified_at = date('Y-m-d H:i:s');
    $driverUser->save();
    echo "SUCCESS: Driver Account cejmartict@gmail.com updated with password '{$password}'\n";
}

// Find or Create Hirer/Rider Account
$hirerUser = User::where('email', 'ikeneumuigbo@gmail.com')->first();
if (!$hirerUser) {
    $maxId = DB::table('users')->max('id') ?: 100;
    $nextId = $maxId + 1;
    $hirerRoleId = DB::table('roles')->where('slug', 'hirer')->value('id') ?: 1;

    DB::table('users')->insert([
        'id' => $nextId,
        'role_id' => $hirerRoleId,
        'name' => 'Ikene Umuigbo',
        'email' => 'ikeneumuigbo@gmail.com',
        'phone' => '08000000001',
        'password' => Hash::make($password),
        'is_active' => 1,
        'email_verified_at' => date('Y-m-d H:i:s'),
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s'),
    ]);
    echo "SUCCESS: Hirer Account ikeneumuigbo@gmail.com created with ID {$nextId} and password '{$password}'\n";
} else {
    $hirerUser->password = Hash::make($password);
    $hirerUser->is_active = 1;
    $hirerUser->email_verified_at = date('Y-m-d H:i:s');
    $hirerUser->save();
    echo "SUCCESS: Hirer Account ikeneumuigbo@gmail.com updated with password '{$password}'\n";
}
