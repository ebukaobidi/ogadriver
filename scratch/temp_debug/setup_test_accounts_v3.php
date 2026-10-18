<?php

header('Content-Type: text/plain');

try {
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=ogadriver;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    $passwordHash = password_hash('3b88WAra', PASSWORD_BCRYPT);
    $now = date('Y-m-d H:i:s');

    // 1. Driver Account: cejmartict@gmail.com (role_id = 2)
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute(['cejmartict@gmail.com']);
    $driverUser = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($driverUser) {
        $stmt = $pdo->prepare("UPDATE users SET name = ?, phone = ?, password = ?, role_id = 2, is_active = 1, email_verified_at = ? WHERE id = ?");
        $stmt->execute(['Martict Driver', '+2348012345678', $passwordHash, $now, $driverUser['id']]);
        $driverUserId = $driverUser['id'];
    } else {
        $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password, role_id, is_active, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, 2, 1, ?, ?, ?)");
        $stmt->execute(['Martict Driver', 'cejmartict@gmail.com', '+2348012345678', $passwordHash, $now, $now, $now]);
        $driverUserId = $pdo->lastInsertId();
    }

    echo "SUCCESS: cejmartict@gmail.com (Driver) configured with password 3b88WAra\n";

    // 2. Hirer Accounts: ikengaumuigbo@gmail.com & ikeneumuigbo@gmail.com
    $hirers = [
        ['email' => 'ikengaumuigbo@gmail.com', 'phone' => '+2348087654321'],
        ['email' => 'ikeneumuigbo@gmail.com', 'phone' => '+2348087654322'],
    ];

    foreach ($hirers as $h) {
        $email = $h['email'];
        $phone = $h['phone'];
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $hirerUser = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($hirerUser) {
            $stmt = $pdo->prepare("UPDATE users SET name = ?, phone = ?, password = ?, role_id = 1, is_active = 1, email_verified_at = ? WHERE id = ?");
            $stmt->execute(['Ikenga Hirer', $phone, $passwordHash, $now, $hirerUser['id']]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password, role_id, is_active, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, 1, 1, ?, ?, ?)");
            $stmt->execute(['Ikenga Hirer', $email, $phone, $passwordHash, $now, $now, $now]);
        }

        echo "SUCCESS: {$email} (Hirer) configured with password 3b88WAra\n";
    }

    echo "\n=== ALL LOCAL TEST ACCOUNTS ARE NOW FIXED AND VERIFIED READY ===";

} catch (\Exception $e) {
    echo "DB ERROR: " . $e->getMessage();
}
