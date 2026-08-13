<?php

namespace Database\Factories;

use App\Models\ExecutiveCarHire;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ExecutiveCarHire>
 */
class ExecutiveCarHireFactory extends Factory
{
    protected $model = ExecutiveCarHire::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->company() . ' Car Hire';
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraph(),
            'state' => $this->faker->state(),
            'lga' => $this->faker->city(),
            'address' => $this->faker->address(),
            'registration_number' => 'RC-' . $this->faker->randomNumber(7, true),
            'contact_email' => $this->faker->companyEmail(),
            'contact_phone' => $this->faker->phoneNumber(),
            'is_active' => true,
            'is_verified' => $this->faker->boolean(70),
            'fleet' => [
                'Luxury Sedans' => 'Available',
                'SUVs' => 'Available',
            ],
            'services' => [
                'Airport Pickup' => 'Yes',
                'VIP Escort' => 'On Request',
            ],
        ];
    }
}
