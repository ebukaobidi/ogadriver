<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class AccommodationController extends Controller
{
    /**
     * Update accommodation preference for a driver.
     * Expected payload:
     *   has_accommodation: boolean
     *   accommodation_details: string (optional)
     */
    public function update(Request $request)
    {
        $request->validate([
            'has_accommodation' => 'required|boolean',
            'accommodation_details' => 'nullable|string|max:1000',
        ]);

        $driver = Auth::user();
        $driver->has_accommodation = $request->input('has_accommodation');
        $driver->accommodation_details = $request->input('accommodation_details');
        $driver->save();

        Log::info('Driver accommodation updated', ['user_id' => $driver->id]);

        return response()->json([
            'message' => 'Accommodation preferences saved',
            'has_accommodation' => $driver->has_accommodation,
            'accommodation_details' => $driver->accommodation_details,
        ]);
    }
}
?>
