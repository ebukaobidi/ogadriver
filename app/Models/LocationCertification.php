<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LocationCertification extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'address_verified' => 'boolean',
        'geo_match' => 'boolean',
        'recommendations' => 'array',
        'certified_at' => 'datetime',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
