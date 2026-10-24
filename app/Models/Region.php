<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'country_code',
        'currency_code',
        'currency_symbol',
        'base_rate_per_km',
        'base_rate_per_minute',
        'minimum_fare',
        'is_active',
    ];

    protected $casts = [
        'base_rate_per_km' => 'decimal:2',
        'base_rate_per_minute' => 'decimal:2',
        'minimum_fare' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
