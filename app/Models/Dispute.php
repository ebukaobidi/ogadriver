<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Dispute extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'raised_by',
        'against_user_id',
        'type',
        'description',
        'status',
        'assigned_to',
        'penalty_amount',
        'penalty_currency',
        'resolution_notes',
        'resolved_at',
        'evidence',
    ];

    protected function casts(): array
    {
        return [
            'penalty_amount' => 'decimal:2',
            'resolved_at' => 'datetime',
            'evidence' => 'array',
        ];
    }

    public function job()
    {
        return $this->belongsTo(TransportJob::class);
    }

    public function raisedBy()
    {
        return $this->belongsTo(User::class, 'raised_by');
    }

    public function againstUser()
    {
        return $this->belongsTo(User::class, 'against_user_id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function assignTo(int $adminId): void
    {
        $this->update([
            'status' => 'under_review',
            'assigned_to' => $adminId,
        ]);
    }

    public function resolve(string $notes, ?float $penaltyAmount = null): void
    {
        $this->update([
            'status' => 'resolved',
            'resolution_notes' => $notes,
            'penalty_amount' => $penaltyAmount,
            'resolved_at' => now(),
        ]);
    }

    public function escalate(): void
    {
        $this->update(['status' => 'escalated']);
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeUnderReview($query)
    {
        return $query->where('status', 'under_review');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resolved');
    }
}
