<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleCost extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_type',
        'fuel_consumption_per_km',
        'maintenance_cost_per_km',
        'depreciation_cost_per_km',
    ];

    protected $casts = [
        'fuel_consumption_per_km' => 'decimal:3',
        'maintenance_cost_per_km' => 'decimal:2',
        'depreciation_cost_per_km' => 'decimal:2',
    ];
}
