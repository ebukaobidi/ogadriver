<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Guarantor extends Model
{
    use HasFactory;

    protected $fillable = [
        'driver_id',
        'full_name',
        'phone_number',
        'email',
        'employment_type',
        'employment_details',
        'id_type',
        'id_number',
        'id_file_path',
        'digital_signature',
        'is_verified',
        'verified_at',
        'verification_reference',
        'acknowledges_liability',
        'liability_acknowledged_at',
        'last_renewal_check',
        'renewal_confirmed',
        'renewal_confirmed_at',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'acknowledges_liability' => 'boolean',
        'liability_acknowledged_at' => 'datetime',
        'last_renewal_check' => 'datetime',
        'renewal_confirmed' => 'boolean',
        'renewal_confirmed_at' => 'datetime',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    /**
     * Check if renewal confirmation is needed
     */
    public function needsRenewalCheck(): bool
    {
        if (!$this->last_renewal_check) {
            return true;
        }

        // Check every 30 days
        return $this->last_renewal_check->lt(now()->subDays(30));
    }

    /**
     * Mark as renewal checked
     */
    public function markRenewalChecked(): void
    {
        $this->update([
            'last_renewal_check' => now(),
        ]);
    }

    /**
     * Confirm renewal
     */
    public function confirmRenewal(): void
    {
        $this->update([
            'renewal_confirmed' => true,
            'renewal_confirmed_at' => now(),
        ]);
    }
}
