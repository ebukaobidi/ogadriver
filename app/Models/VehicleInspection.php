<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleInspection extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'placement_id',
        'checklist',
        'photos',
        'status',
        'notes',
    ];

    protected $casts = [
        'checklist' => 'array',
        'photos' => 'array',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function placement()
    {
        return $this->belongsTo(Job::class, 'placement_id');
    }
}
