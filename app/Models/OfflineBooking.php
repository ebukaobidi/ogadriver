<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OfflineBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sync_id',
        'payload',
        'status',
        'error_message',
        'resulting_booking_id',
    ];

    protected $casts = [
        'payload' => 'array',
    ];
}
