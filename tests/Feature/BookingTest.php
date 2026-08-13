<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Driver;
use App\Models\Hirer;
use App\Models\Booking;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_hirer_can_create_booking()
    {
        $user = User::factory()->create();
        $hirer = Hirer::factory()->create(['user_id' => $user->id]);
        $driverUser = User::factory()->create();
        $driver = Driver::factory()->create(['user_id' => $driverUser->id]);

        $response = $this->actingAs($user, 'api')->postJson('/api/bookings', [
            'driver_id' => $driver->id,
            'pickup_location' => 'Lagos',
            'dropoff_location' => 'Abuja',
            'start_date' => now()->addDay()->toDateString(),
            'end_date' => now()->addDays(3)->toDateString(),
            'agreed_rate' => 15000
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('bookings', [
            'hirer_id' => $hirer->id,
            'driver_id' => $driver->id,
            'status' => 'pending'
        ]);
    }
}
