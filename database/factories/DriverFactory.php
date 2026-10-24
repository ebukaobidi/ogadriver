<?php

namespace Database\Factories;

use App\Models\Driver;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DriverFactory extends Factory
{
    protected $model = Driver::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'license_number' => fake()->bothify('DL-########'),
            'license_class' => 'Class E',
            'license_expiry' => now()->addYears(3),
            'years_of_experience' => 5,
            'is_verified' => true,
            'status' => 'active',
            'subscription_tier' => 'basic',
        ];
    }
}
