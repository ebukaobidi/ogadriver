<?php
header('Content-Type: text/plain');
$pdo = new PDO("mysql:host=127.0.0.1;dbname=ogadriver;charset=utf8mb4", "root", "");
$stmt = $pdo->query("SHOW TABLES LIKE '%hirer%'");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
$stmt = $pdo->query("SHOW TABLES LIKE '%employer%'");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
