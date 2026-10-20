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
        $this->call([
            RoleSeeder::class,
            SuperAdminSeeder::class,
            SubscriptionPlanSeeder::class,
            PlatformDefaultsSeeder::class,
            SiteContentSeeder::class,
            DrivingSchoolSeeder::class,
            ExecutiveCarHireSeeder::class,
        ]);
    }
}
