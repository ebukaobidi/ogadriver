<?php

namespace App\Events;

use App\Models\TransportJob;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JobBroadcasted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $job;

    /**
     * Create a new event instance.
     */
    public function __construct(TransportJob $job)
    {
        $this->job = $job;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('nearby-jobs'),
        ];
    }
    
    public function broadcastWith(): array
    {
        return [
            'id' => $this->job->id,
            'title' => $this->job->title,
            'description' => $this->job->description,
            'amount' => $this->job->amount,
            'pickup_location' => $this->job->pickup_location,
            'pickup_lat' => $this->job->pickup_lat,
            'pickup_lng' => $this->job->pickup_lng,
            'pickup_time' => $this->job->pickup_time,
            'vehicle_type' => $this->job->vehicle_type,
            'is_surge_pricing' => $this->job->is_surge_pricing,
            'surge_multiplier' => $this->job->surge_multiplier,
        ];
    }
}
