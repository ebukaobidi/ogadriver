<?php
$envFile = __DIR__ . '/../.env';
$env = parse_ini_file($envFile);
$host = $env['DB_HOST'] ?? '127.0.0.1';
$port = $env['DB_PORT'] ?? '3306';
$db   = $env['DB_DATABASE'] ?? 'englcxqe_ogadriver';
$user = $env['DB_USERNAME'] ?? 'root';
$pass = $env['DB_PASSWORD'] ?? '';

echo "Connecting to DB: $db at $host:$port...\n";

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "Connected successfully!\n";

    $queries = [
        "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS destination_mode_active TINYINT(1) DEFAULT 0 AFTER is_online;",
        "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS destination_label VARCHAR(255) NULL AFTER destination_mode_active;",
        "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS destination_address VARCHAR(255) NULL AFTER destination_label;",
        "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS destination_latitude DECIMAL(10,7) NULL AFTER destination_address;",
        "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS destination_longitude DECIMAL(10,7) NULL AFTER destination_latitude;",
        "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS destination_max_detour_km DECIMAL(5,2) DEFAULT 5.00 AFTER destination_longitude;"
    ];

    foreach ($queries as $sql) {
        try {
            $pdo->exec($sql);
            echo "SUCCESS: $sql\n";
        } catch (\PDOException $e) {
            echo "NOTE: " . $e->getMessage() . "\n";
        }
    }

    echo "Migration completed successfully!\n";
} catch (\PDOException $e) {
    echo "DB Connection Error: " . $e->getMessage() . "\n";
}
