<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create or find super admin role
        $superAdminRole = Role::firstOrCreate(
            ['slug' => 'super_admin'],
            [
                'name' => 'Super Admin',
                'description' => 'Full system access with all privileges',
            ]
        );

        // Create or find admin role
        $adminRole = Role::firstOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Admin',
                'description' => 'Administrative access with limited privileges',
            ]
        );

        // Create or update super admin user
        $superAdmin = User::updateOrCreate(
            ['email' => 'superadmin@ogadriver.ng'],
            [
                'name' => 'Super Administrator',
                'password' => bcrypt(env('SUPER_ADMIN_PASSWORD', 'ChangeMeInProduction123!')),
                'role_id' => $superAdminRole->id,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Super Admin account created successfully!');
        $this->command->info('Email: superadmin@ogadriver.ng');
        $this->command->warn('IMPORTANT: Set SUPER_ADMIN_PASSWORD in your .env file!');
    }
}
