<?php

namespace App\Events;

use App\Models\TransportJob;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JobCancelled implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TransportJob $job,
        public string $reason
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('hirer.' . $this->job->hirer_id),
        ];

        // If driver was assigned, notify them too
        if ($this->job->driver_id) {
            $channels[] = new PrivateChannel('driver.' . $this->job->driver_id);
        }

        return $channels;
    }

    public function broadcastWith(): array
    {
        return [
            'job_id' => $this->job->id,
            'driver_id' => $this->job->driver_id,
            'hirer_id' => $this->job->hirer_id,
            'cancelled_at' => $this->job->cancelled_at->toIso8601String(),
            'reason' => $this->reason,
        ];
    }

    public function broadcastAs(): string
    {
        return 'job.cancelled';
    }
}
