<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DriverDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'document_type',
        'document_number',
        'file_path',
        'issue_date',
        'expiry_date',
        'is_verified',
        'verified_at',
        'verified_by',
        'ocr_data',
        'rejection_reason',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'expiry_date' => 'date',
            'verified_at' => 'datetime',
            'ocr_data' => 'array',
        ];
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function isExpiringSoon(int $days = 30): bool
    {
        if (! $this->expiry_date) {
            return false;
        }

        return $this->expiry_date <= now()->addDays($days) && $this->expiry_date >= now()->startOfDay();
    }

    public function isExpired(): bool
    {
        if (! $this->expiry_date) {
            return false;
        }

        return $this->expiry_date < now()->startOfDay();
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->where('expiry_date', '<=', now()->addDays($days))->where('expiry_date', '>', now());
    }

    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now()->startOfDay());
    }

    public function approve(int $verifierId): void
    {
        $this->update([
            'status' => 'approved',
            'is_verified' => true,
            'verified_at' => now(),
            'verified_by' => $verifierId,
        ]);
    }

    public function reject(string $reason, int $verifierId): void
    {
        $this->update([
            'status' => 'rejected',
            'is_verified' => false,
            'rejection_reason' => $reason,
            'verified_by' => $verifierId,
        ]);
    }
}
