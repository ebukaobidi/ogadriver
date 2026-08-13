<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\DrivingSchoolSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // No test data - production deployment
        $this->call([
            DrivingSchoolSeeder::class,
            ExecutiveCarHireSeeder::class,
        ]);
    }
}
