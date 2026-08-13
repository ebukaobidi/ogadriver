<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HandoverChecklist extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'driver_id',
        'hirer_id',
        'tyres_condition_ok',
        'fuel_level_recorded',
        'warning_lights_check',
        'brakes_functional',
        'lights_functional',
        'mirrors_adjusted',
        'seatbelts_functional',
        'windshield_wipers_ok',
        'vehicle_documents_valid',
        'fuel_level_percentage',
        'condition_notes',
        'vehicle_papers_valid',
        'insurance_valid',
        'road_worthiness_valid',
        'waiver_required',
        'waiver_signed_by_hirer',
        'waiver_signed_at',
        'waiver_reason',
        'photo_evidence',
        'completed_at',
        'verified_at',
        'status',
    ];

    protected $casts = [
        'fuel_level_percentage' => 'integer',
        'waiver_required' => 'boolean',
        'waiver_signed_by_hirer' => 'boolean',
        'waiver_signed_at' => 'datetime',
        'completed_at' => 'datetime',
        'verified_at' => 'datetime',
        'photo_evidence' => 'array',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function hirer()
    {
        return $this->belongsTo(Hirer::class);
    }

    /**
     * Check if all safety checks are completed
     */
    public function allSafetyChecksCompleted(): bool
    {
        return $this->tyres_condition_ok &&
               $this->fuel_level_recorded &&
               $this->warning_lights_check &&
               $this->brakes_functional &&
               $this->lights_functional &&
               $this->mirrors_adjusted &&
               $this->seatbelts_functional &&
               $this->windshield_wipers_ok &&
               $this->vehicle_documents_valid;
    }

    /**
     * Check if all vehicle documents are valid
     */
    public function allDocumentsValid(): bool
    {
        return $this->vehicle_papers_valid &&
               $this->insurance_valid &&
               $this->road_worthiness_valid;
    }

    /**
     * Determine if waiver is required based on document validity
     */
    public function determineWaiverRequirement(): void
    {
        if (!$this->allDocumentsValid()) {
            $reasons = [];
            if (!$this->vehicle_papers_valid) $reasons[] = 'Vehicle papers expired/invalid';
            if (!$this->insurance_valid) $reasons[] = 'Insurance expired/invalid';
            if (!$this->road_worthiness_valid) $reasons[] = 'Road worthiness certificate expired/invalid';

            $this->update([
                'waiver_required' => true,
                'waiver_reason' => implode(', ', $reasons),
                'status' => 'waiver_required',
            ]);
        }
    }

    /**
     * Mark waiver as signed by hirer
     */
    public function signWaiver(): void
    {
        $this->update([
            'waiver_signed_by_hirer' => true,
            'waiver_signed_at' => now(),
            'status' => 'waiver_signed',
        ]);
    }

    /**
     * Complete the handover checklist
     */
    public function complete(): void
    {
        $this->update([
            'completed_at' => now(),
            'status' => 'completed',
        ]);
    }

    /**
     * Verify the handover checklist (by hirer)
     */
    public function verify(): void
    {
        $this->update([
            'verified_at' => now(),
        ]);
    }

    /**
     * Check if handover can proceed
     */
    public function canProceed(): bool
    {
        if ($this->waiver_required && !$this->waiver_signed_by_hirer) {
            return false;
        }

        return $this->allSafetyChecksCompleted();
    }

    /**
     * Get completion percentage
     */
    public function getCompletionPercentage(): float
    {
        $checks = [
            'tyres_condition_ok',
            'fuel_level_recorded',
            'warning_lights_check',
            'brakes_functional',
            'lights_functional',
            'mirrors_adjusted',
            'seatbelts_functional',
            'windshield_wipers_ok',
            'vehicle_documents_valid',
        ];

        $completed = 0;
        foreach ($checks as $check) {
            if ($this->$check) {
                $completed++;
            }
        }

        return ($completed / count($checks)) * 100;
    }
}
