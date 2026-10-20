<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\User;
use App\Models\Driver;
use App\Models\Hirer;
use App\Models\Booking;
use App\Models\DriverAvailability;

class BookingTest extends TestCase
{
    use RefreshDatabase;

    public function test_hirer_can_create_booking()
    {
        $user = User::factory()->create();
        $hirer = Hirer::factory()->create(['user_id' => $user->id]);
        $driverUser = User::factory()->create();
        $driver = Driver::factory()->create(['user_id' => $driverUser->id]);

        $pickupTime = now()->addDay();
        DriverAvailability::factory()->create([
            'driver_id' => $driver->id,
            'date' => $pickupTime->toDateString(),
            'status' => 'available'
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/bookings', [
            'driver_id' => $driver->id,
            'title' => 'Test Booking',
            'vehicle_type' => 'light_truck',
            'pickup_location' => 'Lagos',
            'pickup_latitude' => 6.5244,
            'pickup_longitude' => 3.3792,
            'dropoff_location' => 'Abuja',
            'dropoff_latitude' => 9.0765,
            'dropoff_longitude' => 7.3986,
            'pickup_time' => $pickupTime->toDateTimeString(),
            'pricing_type' => 'trip',
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
