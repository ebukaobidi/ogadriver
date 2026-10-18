<?php

header('Content-Type: text/plain');

try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=ogadriver;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $passwordHash = password_hash('3b88WAra', PASSWORD_BCRYPT);
    $now = date('Y-m-d H:i:s');

    // 1. Driver Account: cejmartict@gmail.com
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute(['cejmartict@gmail.com']);
    $driverUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($driverUser) {
        $stmt = $pdo->prepare("UPDATE users SET name = ?, phone = ?, password = ?, user_type = 'driver', is_verified = 1, email_verified_at = ? WHERE id = ?");
        $stmt->execute(['Martict Driver', '+2348012345678', $passwordHash, $now, $driverUser['id']]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password, user_type, is_verified, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, 'driver', 1, ?, ?, ?)");
        $stmt->execute(['Martict Driver', 'cejmartict@gmail.com', '+2348012345678', $passwordHash, $now, $now, $now]);
    }
    echo "SUCCESS: cejmartict@gmail.com (Driver) updated with password 3b88WAra\n";

    // 2. Hirer Accounts: ikengaumuigbo@gmail.com & ikeneumuigbo@gmail.com
    $hirerEmails = ['ikengaumuigbo@gmail.com', 'ikeneumuigbo@gmail.com'];
    foreach ($hirerEmails as $email) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $hirerUser = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($hirerUser) {
            $stmt = $pdo->prepare("UPDATE users SET name = ?, phone = ?, password = ?, user_type = 'hirer', is_verified = 1, email_verified_at = ? WHERE id = ?");
            $stmt->execute(['Ikenga Hirer', '+2348087654321', $passwordHash, $now, $hirerUser['id']]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password, user_type, is_verified, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, 'hirer', 1, ?, ?, ?)");
            $stmt->execute(['Ikenga Hirer', $email, '+2348087654321', $passwordHash, $now, $now, $now]);
        }
        echo "SUCCESS: {$email} (Hirer) updated with password 3b88WAra\n";
    }

    echo "\n=== ALL LOCAL TEST ACCOUNTS ARE NOW FIXED AND READY FOR LOGIN ===";

} catch (\Exception $e) {
    echo "DB ERROR: " . $e->getMessage();
}
