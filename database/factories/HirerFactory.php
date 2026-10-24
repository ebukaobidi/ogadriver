<?php

namespace Database\Factories;

use App\Models\Hirer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class HirerFactory extends Factory
{
    protected $model = Hirer::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'company_name' => fake()->company(),
            'industry' => fake()->word(),
            'subscription_tier' => 'basic',
            'max_concurrent_contracts' => 5,
            'verification_status' => 'verified',
        ];
    }
}
