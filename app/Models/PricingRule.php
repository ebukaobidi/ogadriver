<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PricingRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'region',
        'multiplier',
        'start_time',
        'end_time',
        'days_of_week',
        'is_active',
    ];

    protected $casts = [
        'multiplier' => 'decimal:2',
        'days_of_week' => 'array',
        'is_active' => 'boolean',
    ];
}
