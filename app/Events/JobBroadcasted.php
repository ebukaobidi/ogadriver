<?php

namespace App\Events;

use App\Models\TransportJob;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JobBroadcasted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public TransportJob $job,
        public array $nearbyDriverIds
    ) {}

    public function broadcastOn(): array
    {
        $channels = [];
        
        // Broadcast to each nearby driver's private channel
        foreach ($this->nearbyDriverIds as $driverId) {
            $channels[] = new PrivateChannel('driver.' . $driverId);
        }
        
        return $channels;
    }

    public function broadcastWith(): array
    {
        return [
            'job_id' => $this->job->id,
            'title' => $this->job->title,
            'description' => $this->job->description,
            'vehicle_type' => $this->job->vehicle_type,
            'amount' => $this->job->amount,
            'pickup_location' => $this->job->pickup_location,
            'pickup_latitude' => $this->job->pickup_latitude,
            'pickup_longitude' => $this->job->pickup_longitude,
            'dropoff_location' => $this->job->dropoff_location,
            'pickup_time' => $this->job->pickup_time->toIso8601String(),
            'distance_km' => $this->job->distance_km,
            'is_early_access' => $this->job->is_early_access,
            'is_surge_pricing' => $this->job->is_surge_pricing,
            'surge_multiplier' => $this->job->surge_multiplier,
            'required_certifications' => $this->job->required_certifications,
            'created_at' => now()->toIso8601String(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'job.broadcasted';
    }
}
