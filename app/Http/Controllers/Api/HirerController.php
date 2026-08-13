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
        ]);

        $data = [
            'identity_type' => $validated['identity_type'],
            'identity_number' => $validated['identity_number'],
            'emergency_contact_name' => $validated['emergency_contact_name'],
            'emergency_contact_phone' => $validated['emergency_contact_phone'],
            'state_id' => $validated['state_id'] ?? null,
            'city_id' => $validated['city_id'] ?? null,
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
}
