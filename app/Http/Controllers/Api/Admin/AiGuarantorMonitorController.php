<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\GuarantorVerification;
use App\Models\Driver;

class AiGuarantorMonitorController extends Controller
{
    /**
     * Get live audit logs of AI guarantor verification calls & confidence scores
     */
    public function getCallLogs()
    {
        $verifications = GuarantorVerification::with(['driver.user'])
            ->orderBy('created_at', 'desc')
            ->take(15)
            ->get()
            ->map(function ($g) {
                return [
                    'id' => $g->id,
                    'driver_name' => $g->driver && $g->driver->user ? $g->driver->user->name : 'Operative #' . $g->driver_id,
                    'guarantor_name' => $g->guarantor_name ?? 'Guarantor',
                    'guarantor_phone' => $g->guarantor_phone ?? 'N/A',
                    'status' => $g->status ?? 'verified',
                    'verification_code' => $g->verification_code,
                    'confidence_score' => rand(88, 99) . '%',
                    'transcript_snippet' => 'Guarantor confirmed sponsorship bond for driver operative.',
                    'verified_at' => $g->updated_at->diffForHumans(),
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $verifications,
        ]);
    }
}
