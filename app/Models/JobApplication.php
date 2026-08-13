<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class JobApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'driver_id',
        'status',
        'proposed_amount',
        'cover_letter',
        'applied_at',
        'responded_at',
        'responded_by',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'proposed_amount' => 'decimal:2',
            'applied_at' => 'datetime',
            'responded_at' => 'datetime',
        ];
    }

    public function job()
    {
        return $this->belongsTo(TransportJob::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function responder()
    {
        return $this->belongsTo(User::class, 'responded_by');
    }

    public function accept(int $responderId): void
    {
        $this->update([
            'status' => 'accepted',
            'responded_at' => now(),
            'responded_by' => $responderId,
        ]);
    }

    public function reject(string $reason, int $responderId): void
    {
        $this->update([
            'status' => 'rejected',
            'responded_at' => now(),
            'responded_by' => $responderId,
            'rejection_reason' => $reason,
        ]);
    }

    public function withdraw(): void
    {
        $this->update(['status' => 'withdrawn']);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }
}
