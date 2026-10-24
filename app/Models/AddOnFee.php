<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AddOnFee extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'amount',
        'type',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'amount' => 'decimal:2',
    ];
}
