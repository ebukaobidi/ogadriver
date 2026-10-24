<?php

namespace Database\Factories;

use App\Models\DriverAvailability;
use App\Models\Driver;
use Illuminate\Database\Eloquent\Factories\Factory;

class DriverAvailabilityFactory extends Factory
{
    protected $model = DriverAvailability::class;

    public function definition(): array
    {
        return [
            'driver_id' => Driver::factory(),
            'date' => now()->toDateString(),
            'status' => 'available',
        ];
    }
}
