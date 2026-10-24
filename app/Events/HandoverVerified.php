<?php

namespace App\Events;

use App\Models\HandoverChecklist;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HandoverVerified implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public HandoverChecklist $checklist
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('driver.' . $this->checklist->driver_id),
            new PrivateChannel('hirer.' . $this->checklist->hirer_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'booking_id' => $this->checklist->booking_id,
            'verified_at' => $this->checklist->verified_at?->toIso8601String(),
            'status' => 'verified',
        ];
    }

    public function broadcastAs(): string
    {
        return 'handover.verified';
    }
}
