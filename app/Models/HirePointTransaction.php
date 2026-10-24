<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HirePointTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'type',
        'points',
        'balance_before',
        'balance_after',
        'reason',
        'job_id',
        'cost_amount',
        'currency',
    ];

    protected $casts = [
        'points' => 'integer',
        'balance_before' => 'integer',
        'balance_after' => 'integer',
        'cost_amount' => 'decimal:2',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function job()
    {
        return $this->belongsTo(TransportJob::class, 'job_id');
    }
}
