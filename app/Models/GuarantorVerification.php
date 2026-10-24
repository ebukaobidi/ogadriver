<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuarantorVerification extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'answers' => 'array',
        'analysis' => 'array',
        'location_data' => 'array',
        'verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    public function guarantor()
    {
        return $this->belongsTo(Guarantor::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
