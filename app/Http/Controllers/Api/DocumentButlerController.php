<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Driver;
use App\Models\DocumentRenewal;

class DocumentButlerController extends Controller
{
    /**
     * Get expiring documents status & renewal butler status
     */
    public function getStatus()
    {
        $user = auth()->user();
        $driver = Driver::where('user_id', $user->id)->first();
        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver not found'], 404);
        }

        $renewals = DocumentRenewal::where('driver_id', $driver->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $licenseExpiry = $driver->license_expiry ? $driver->license_expiry->toDateString() : null;
        $isExpiringSoon = $driver->license_expiry && $driver->license_expiry->diffInDays(now()) <= 30;

        return response()->json([
            'success' => true,
            'data' => [
                'license_expiry' => $licenseExpiry,
                'is_expiring_soon' => $isExpiringSoon,
                'renewals' => $renewals,
            ],
        ]);
    }

    /**
     * Submit 1-Click Auto-Renewal Request
     */
    public function requestRenewal(Request $request)
    {
        $request->validate([
            'document_type' => 'required|string',
            'partner_agency' => 'nullable|string',
        ]);

        $user = auth()->user();
        $driver = Driver::where('user_id', $user->id)->first();
        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver record missing'], 404);
        }

        $renewal = DocumentRenewal::create([
            'driver_id' => $driver->id,
            'document_type' => $request->document_type,
            'expiry_date' => $driver->license_expiry ?? now()->addMonth(),
            'status' => 'pending',
            'fee_amount' => 5000.00,
            'partner_agency' => $request->partner_agency ?? 'FRSC / LASDRI Partner Portal',
            'notes' => '1-click Auto-Renewal Butler submitted via app',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Auto-Renewal Butler request submitted successfully! Your dedicated licensing agent will process the renewal.',
            'data' => $renewal,
        ]);
    }
}
