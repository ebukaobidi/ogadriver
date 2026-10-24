<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoyaltyPoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'points',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'points' => 'integer',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
