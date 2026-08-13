<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class TestLoginCommand extends Command
{
    protected $signature = 'app:test-login-command';

    protected $description = 'Test login functionality';

    public function handle()
    {
        $email = 'superadmin@ogadriver.ng';
        $password = 'SuperAdmin@2026';

        $this->info('Testing login for: ' . $email);

        // Find user
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error('User not found');
            return 1;
        }

        $this->info('User found: ' . $user->name);
        $this->info('Role: ' . $user->role->slug);
        $this->info('Active: ' . ($user->is_active ? 'Yes' : 'No'));

        // Test password
        if (Auth::attempt(['email' => $email, 'password' => $password])) {
            $this->info('Password verification: SUCCESS');
            
            // Test API token generation and storage
            try {
                $apiToken = 'og_' . bin2hex(random_bytes(32));
                $user->update(['api_token' => $apiToken]);
                $this->info('API token generation: SUCCESS');
                $this->info('Token (first 20 chars): ' . substr($apiToken, 0, 20) . '...');
                
                // Verify token was stored
                $verifyUser = User::where('api_token', $apiToken)->first();
                if ($verifyUser && $verifyUser->id === $user->id) {
                    $this->info('Token storage verification: SUCCESS');
                } else {
                    $this->error('Token storage verification: FAILED');
                    return 1;
                }
                
                Auth::logout();
                return 0;
            } catch (\Exception $e) {
                $this->error('API token generation failed: ' . $e->getMessage());
                return 1;
            }
        } else {
            $this->error('Password verification: FAILED');
            return 1;
        }
    }
}
