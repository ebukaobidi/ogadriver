<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Infraction extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'hirer_id',
        'type',
        'description',
        'status',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function hirer()
    {
        return $this->belongsTo(Hirer::class);
    }
}
