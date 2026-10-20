<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;

// Serve the frontend index.html on root (SPA)
Route::get('/', function () {
    return file_get_contents(public_path('index.html'));
});

// Google OAuth Routes
Route::get('/auth/google', [GoogleAuthController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback']);
Route::post('/auth/logout', [GoogleAuthController::class, 'logout']);

// Failsafe Storage Fallback for cPanel shared hosting symlink issues
Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);
    
    if (!file_exists($fullPath)) {
        abort(404);
    }
    
    $file = file_get_contents($fullPath);
    $type = mime_content_type($fullPath);
    
    return response($file, 200)->header('Content-Type', $type);
})->where('path', '.*');

// Account Deletion & Privacy Compliance (Google Play & App Store Compliance URL)
Route::get('/delete-account', [\App\Http\Controllers\Auth\LoginController::class, 'showDeleteAccountPage']);
Route::post('/delete-account-request', [\App\Http\Controllers\Auth\LoginController::class, 'submitWebDeleteRequest']);

// SPA Catch-all Route
Route::fallback(function () {
    return file_get_contents(public_path('index.html'));
});
