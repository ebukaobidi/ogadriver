<?php

namespace App\Events;

use App\Models\Driver;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DriverLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Driver $driver,
        public float $latitude,
        public float $longitude,
        public string $status
    ) {}

    public function broadcastOn(): array
    {
        // Broadcast to all hirers who have this driver as favorite
        $channels = [];
        
        $favoriteHirers = $driver->favoriteDrivers()->pluck('hirer_id');
        foreach ($favoriteHirers as $hirerId) {
            $channels[] = new PrivateChannel('hirer.' . $hirerId);
        }

        return $channels;
    }

    public function broadcastWith(): array
    {
        return [
            'driver_id' => $this->driver->id,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'status' => $this->status,
            'updated_at' => now()->toIso8601String(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'driver.location.updated';
    }
}
