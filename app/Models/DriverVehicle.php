<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverVehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'vehicle_type',
        'is_armored',
        'make',
        'model',
        'year',
        'color',
        'plate_number',
        'ownership_type',
        'expected_daily_rate',
        'expected_monthly_rate',
        'proof_of_ownership_doc',
        'vehicle_license_doc',
        'roadworthiness_doc',
        'commercial_insurance_doc',
        'insurance_expiry_date',
        'roadworthiness_expiry_date',
        'front_photo',
        'side_photo',
        'interior_photo',
        'verification_status',
        'is_active',
        'rejection_reason',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_armored' => 'boolean',
        'expected_daily_rate' => 'decimal:2',
        'expected_monthly_rate' => 'decimal:2',
        'insurance_expiry_date' => 'date',
        'roadworthiness_expiry_date' => 'date',
    ];

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
