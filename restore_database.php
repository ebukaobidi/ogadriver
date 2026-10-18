<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$sqlFile = __DIR__ . '/ogadriver_restore.sql';
if (!file_exists($sqlFile)) {
    echo "ERROR: ogadriver_restore.sql not found at {$sqlFile}\n";
    exit(1);
}

echo "Importing previous accounts and database from ogadriver_restore.sql...\n";

$dbHost = config('database.connections.mysql.host', '127.0.0.1');
$dbPort = config('database.connections.mysql.port', '3306');
$dbUser = config('database.connections.mysql.username', 'root');
$dbPass = config('database.connections.mysql.password', '');
$dbName = config('database.connections.mysql.database', 'ogadriver');

$cmd = sprintf(
    'mysql -h %s -P %s -u %s %s %s < %s 2>&1',
    escapeshellarg($dbHost),
    escapeshellarg($dbPort),
    escapeshellarg($dbUser),
    $dbPass ? '-p' . escapeshellarg($dbPass) : '',
    escapeshellarg($dbName),
    escapeshellarg($sqlFile)
);

$cliOutput = [];
$cliReturn = null;
@exec($cmd, $cliOutput, $cliReturn);

if ($cliReturn !== 0) {
    echo "CLI restore note: attempting direct PDO execution fallback...\n";
    try {
        ini_set('memory_limit', '512M');
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        $sql = file_get_contents($sqlFile);
        DB::unprepared($sql);
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    } catch (\Exception $e) {
        echo "ERROR during restore: " . $e->getMessage() . "\n";
        exit(1);
    }
}

try {
    $users = DB::table('users')->count();
    $drivers = DB::table('drivers')->count();
    $hirers = DB::table('hirers')->count();

    echo "===========================================\n";
    echo "RESTORE COMPLETED SUCCESSFULLY!\n";
    echo "Users Restored: {$users}\n";
    echo "Drivers Restored: {$drivers}\n";
    echo "Hirers Restored: {$hirers}\n";
    echo "===========================================\n";
} catch (\Exception $e) {
    echo "Note: tables restored, error counting: " . $e->getMessage() . "\n";
}
