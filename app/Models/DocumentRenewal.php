<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentRenewal extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'document_type',
        'expiry_date',
        'status',
        'fee_amount',
        'partner_agency',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'expiry_date' => 'date',
            'fee_amount' => 'decimal:2',
        ];
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
