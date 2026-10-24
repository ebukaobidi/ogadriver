<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FuelPrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'region',
        'fuel_type',
        'price_per_liter',
        'source',
        'effective_at',
    ];

    protected $casts = [
        'price_per_liter' => 'decimal:2',
        'effective_at' => 'datetime',
    ];
}
