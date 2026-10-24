<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverPayout extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'user_id',
        'amount',
        'bank_code',
        'bank_name',
        'account_number',
        'account_name',
        'transfer_reference',
        'status',
        'gateway',
        'failure_reason',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'metadata' => 'array',
        ];
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
