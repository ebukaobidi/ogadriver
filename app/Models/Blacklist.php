<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Blacklist extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'entity_type',
        'entity_identifier',
        'reason',
        'severity',
        'banned_at',
        'banned_until',
        'notes',
        'banned_by',
        'metadata',
    ];

    protected $casts = [
        'banned_at' => 'datetime',
        'banned_until' => 'datetime',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bannedBy()
    {
        return $this->belongsTo(User::class, 'banned_by');
    }

    /**
     * Check if blacklist is currently active
     */
    public function isActive(): bool
    {
        if ($this->severity === 'permanent') {
            return true;
        }

        if ($this->severity === 'temporary' && $this->banned_until) {
            return now()->lt($this->banned_until);
        }

        return false;
    }

    /**
     * Check if entity is blacklisted
     */
    public static function isBlacklisted(string $entityType, string $entityIdentifier): bool
    {
        return static::where('entity_type', $entityType)
            ->where('entity_identifier', $entityIdentifier)
            ->where(function ($query) {
                $query->where('severity', 'permanent')
                      ->orWhere(function ($q) {
                          $q->where('severity', 'temporary')
                            ->where('banned_until', '>', now());
                      });
            })
            ->exists();
    }

    /**
     * Blacklist an entity
     */
    public static function blacklistEntity(
        string $entityType,
        string $entityIdentifier,
        string $reason,
        string $severity = 'permanent',
        ?int $userId = null,
        ?int $bannedBy = null,
        ?string $notes = null
    ): self {
        return static::create([
            'user_id' => $userId,
            'entity_type' => $entityType,
            'entity_identifier' => $entityIdentifier,
            'reason' => $reason,
            'severity' => $severity,
            'banned_at' => now(),
            'banned_until' => $severity === 'temporary' ? now()->addDays(30) : null,
            'notes' => $notes,
            'banned_by' => $bannedBy,
        ]);
    }
}
