<?php

namespace App\Events;

use App\Models\TransportJob;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JobCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TransportJob $job
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('driver.' . $this->job->driver_id),
            new PrivateChannel('hirer.' . $this->job->hirer_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'job_id' => $this->job->id,
            'driver_id' => $this->job->driver_id,
            'hirer_id' => $this->job->hirer_id,
            'completed_at' => $this->job->completed_at->toIso8601String(),
            'amount' => $this->job->amount,
            'final_destination' => $this->job->dropoff_location,
        ];
    }

    public function broadcastAs(): string
    {
        return 'job.completed';
    }
}
