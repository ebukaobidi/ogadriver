<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::firstOrCreate(
            ['slug' => 'hirer'],
            [
                'name' => 'Employer / Hirer',
                'description' => 'Employer looking to hire drivers',
            ]
        );

        Role::firstOrCreate(
            ['slug' => 'driver'],
            [
                'name' => 'Driver Operative',
                'description' => 'Driver seeking employment',
            ]
        );
    }
}
