<?php
require __DIR__ . '/../vendor/autoload.php';

use Aws\S3\S3Client;

$s3 = new S3Client([
    'version' => 'latest',
    'region' => 'us-east-1',
    'endpoint' => 'https://e3017bfeecfb39f439014728c25ab78b.r2.cloudflarestorage.com',
    'use_path_style_endpoint' => true,
    'credentials' => [
        'key' => '3579ab801691cca18e6ab82210f350aa',
        'secret' => '36021165f8a029e95ef9c0d967d78f21e0878d887e31b62ffb759526333dfaaf',
    ],
]);

$cmd = $s3->getCommand('GetObject', [
    'Bucket' => 'ogadriver',
    'Key' => 'deploy/ogadriver_deploy.zip',
]);

$request = $s3->createPresignedRequest($cmd, '+2 hours');
$presignedUrl = (string) $request->getUri();

echo "\nPRESIGNED_URL_START\n";
echo $presignedUrl . "\n";
echo "PRESIGNED_URL_END\n";
