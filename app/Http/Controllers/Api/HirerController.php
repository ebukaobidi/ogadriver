<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HirerController extends Controller
{
    /**
     * Submit KYC Safety details for Employer.
     */
    public function updateKyc(Request $request)
    {
        $user = Auth::user();
        if ($user->role->slug !== 'hirer' || !$user->hirer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'identity_type' => 'required|string',
            'identity_number' => 'required|string',
            'identity_image' => 'nullable|file|mimes:pdf,jpg,png,jpeg|max:5120',
            'emergency_contact_name' => 'required|string',
            'emergency_contact_phone' => 'required|string',
            'state_id' => 'nullable|integer',
            'city_id' => 'nullable|integer',
            'accommodation_preference' => 'nullable|in:with_accommodation,without_accommodation,flexible',
        ]);

        $data = [
            'identity_type' => $validated['identity_type'],
            'identity_number' => $validated['identity_number'],
            'emergency_contact_name' => $validated['emergency_contact_name'],
            'emergency_contact_phone' => $validated['emergency_contact_phone'],
            'state_id' => $validated['state_id'] ?? null,
            'city_id' => $validated['city_id'] ?? null,
            'accommodation_preference' => $validated['accommodation_preference'] ?? 'flexible',
            'verification_status' => 'pending', // Goes to pending review
        ];

        if ($request->hasFile('identity_image')) {
            // Delete old identity image if it exists
            if ($user->hirer->identity_image) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->hirer->identity_image);
            }
            $path = $request->file('identity_image')->store('documents/hirers/' . $user->hirer->id, 'public');
            $data['identity_image'] = $path;
        }

        $user->hirer->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Safety KYC data submitted successfully.',
            'data' => $user->hirer
        ]);
    }

    /**
     * Unlock a driver's full profile (Pay-Per-Reveal).
     */
    public function unlockDriver(Request $request)
    {
        $user = Auth::user();
        if ($user->role->slug !== 'hirer' || !$user->hirer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'driver_id' => 'required|exists:drivers,id',
            'payment_reference' => 'required|string'
        ]);

        // In a real scenario, you'd verify the payment reference with Paystack/Flutterwave
        // For now, assume the payment of ₦15,000 (or equivalent) was successful.

        \Illuminate\Support\Facades\DB::table('hirer_unlocked_drivers')->updateOrInsert(
            [
                'hirer_id' => $user->hirer->id,
                'driver_id' => $validated['driver_id']
            ],
            [
                'amount_paid' => 15000.00,
                'payment_reference' => $validated['payment_reference'],
                'created_at' => now(),
                'updated_at' => now()
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Driver contact unlocked successfully.',
        ]);
    }

    /**
     * Get real-time fleet telemetry for the Hirer's active drivers.
     */
    public function getFleetTelemetry(Request $request)
    {
        $user = Auth::user();
        $user->loadMissing(['role', 'hirer']);

        if (!$user->hirer && $user->role && in_array($user->role->slug, ['hirer', 'employer'], true)) {
            $user->hirer()->create([
                'company_name' => $user->name,
                'subscription_tier' => 'free',
                'max_concurrent_contracts' => 3,
                'verification_status' => 'unverified',
            ]);
            $user->load('hirer');
        }

        if (!$user->hirer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $jobDriverIds = \App\Models\TransportJob::where('hirer_id', $user->hirer->id)
            ->whereIn('status', ['assigned', 'in_progress'])
            ->pluck('driver_id');

        $bookingDriverIds = \App\Models\Booking::where('hirer_id', $user->hirer->id)
            ->whereIn('status', ['accepted', 'in_progress', 'driver_en_route', 'arrived', 'active'])
            ->whereNotNull('driver_id')
            ->pluck('driver_id');

        $activeDriverIds = $jobDriverIds->merge($bookingDriverIds)->filter()->unique()->values();

        $activeBookings = \App\Models\Booking::with(['driver.user'])
            ->where('hirer_id', $user->hirer->id)
            ->whereIn('status', [
                'pending', 'assessment_pending', 'accepted', 'in_progress',
                'driver_en_route', 'arrived', 'active', 'open',
            ])
            ->orderByDesc('updated_at')
            ->limit(40)
            ->get();

        if ($activeDriverIds->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
                'bookings' => $activeBookings,
            ]);
        }

        $locations = \App\Models\DriverLocation::with('driver.user')
            ->whereIn('driver_id', $activeDriverIds)
            ->where('updated_at', '>=', now()->subHours(24))
            ->orderBy('updated_at', 'desc')
            ->get()
            ->unique('driver_id')
            ->values();

        return response()->json([
            'success' => true,
            'data' => $locations,
            'bookings' => $activeBookings,
        ]);
    }
}
