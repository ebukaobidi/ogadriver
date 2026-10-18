<?php
header('Content-Type: text/plain');
$pdo = new PDO("mysql:host=127.0.0.1;dbname=ogadriver;charset=utf8mb4", "root", "");
$stmt = $pdo->query("DESCRIBE users");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
