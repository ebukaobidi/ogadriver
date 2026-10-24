<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ActivatedLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'state_id',
        'city_id',
        'name',
        'is_ride_active',
        'is_hire_active',
        'ride_driver_count',
        'hire_driver_count',
        'min_threshold',
        'manual_override',
    ];

    protected $casts = [
        'is_ride_active' => 'boolean',
        'is_hire_active' => 'boolean',
        'manual_override' => 'boolean',
        'ride_driver_count' => 'integer',
        'hire_driver_count' => 'integer',
        'min_threshold' => 'integer',
    ];

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }
}
