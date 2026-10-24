<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmergencySosAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'user_id',
        'latitude',
        'longitude',
        'address',
        'audio_clip_path',
        'status',
        'resolved_at',
        'resolved_by',
        'notified_contacts',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'resolved_at' => 'datetime',
            'notified_contacts' => 'array',
        ];
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
