<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SosTriggered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $driverId,
        public array $location,
        public string $type = 'REVERSE_SOS'
    ) {}

    public function broadcastOn(): array
    {
        // Broadcast to a dedicated admin channel
        return [
            new PrivateChannel('admin.alerts'),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'driver_id' => $this->driverId,
            'location' => $this->location,
            'type' => $this->type,
            'severity' => 'CRITICAL',
            'timestamp' => now()->toIso8601String(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'sos.triggered';
    }
}
