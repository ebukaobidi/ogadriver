<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TelemetryUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $bookingId,
        public array $telemetry
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('bookings.' . $this->bookingId . '.telemetry'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'booking_id' => $this->bookingId,
            'latitude' => $this->telemetry['latitude'],
            'longitude' => $this->telemetry['longitude'],
            'speed_kmh' => $this->telemetry['speed_kmh'] ?? 0,
            'hard_braking' => $this->telemetry['hard_braking'] ?? false,
            'aggressive_cornering' => $this->telemetry['aggressive_cornering'] ?? false,
            'speeding' => $this->telemetry['speeding'] ?? false,
            'timestamp' => now()->toIso8601String(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'telemetry.updated';
    }
}
