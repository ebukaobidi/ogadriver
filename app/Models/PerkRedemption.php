<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerkRedemption extends Model
{
    use HasFactory;

    protected $fillable = [
        'perk_id',
        'driver_id',
        'qr_token',
        'amount_saved',
        'status',
        'redeemed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_saved' => 'decimal:2',
            'redeemed_at' => 'datetime',
        ];
    }

    public function perk()
    {
        return $this->belongsTo(DriverPerk::class, 'perk_id');
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
