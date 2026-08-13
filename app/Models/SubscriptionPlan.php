<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'target_role',
        'name',
        'price',
        'period',
        'limits',
        'status',
        'isPopular',
        'features',
    ];

    protected $casts = [
        'isPopular' => 'boolean',
        'features' => 'array',
    ];
}
