<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'hirer_id',
        'booking_id',
        'score',
        'review_text',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function hirer()
    {
        return $this->belongsTo(Hirer::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
