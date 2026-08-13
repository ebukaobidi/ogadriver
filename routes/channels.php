<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Booking;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user has the ability to listen to the
| given channel.
|
*/

/**
 * Authorize the live tracking channel strictly for the hiring employer
 * This ensures ONLY the specific employer who paid for the active contract
 * can view the coordinate streams - no public access for security
 */
Broadcast::channel('bookings.{bookingId}.telemetry', function ($user, $bookingId) {
    $booking = Booking::find($bookingId);
    
    if (!$booking) {
        return false;
    }

    // Ruthless Guard: Only the exact employer who initiated the hire can authenticate to this stream
    return (int) $user->id === (int) $booking->hirer->user_id;
});

/**
 * Authorize booking updates channel for both driver and hirer
 */
Broadcast::channel('bookings.{bookingId}.updates', function ($user, $bookingId) {
    $booking = Booking::find($bookingId);
    
    if (!$booking) {
        return false;
    }

    // Allow both driver and hirer to listen to booking updates
    if ($user->driver && (int) $user->driver->id === (int) $booking->driver_id) {
        return [
            'role' => 'driver',
            'booking_id' => $booking->id,
        ];
    }

    if ($user->hirer && (int) $user->hirer->id === (int) $booking->hirer_id) {
        return [
            'role' => 'hirer',
            'booking_id' => $booking->id,
        ];
    }

    return false;
});

/**
 * Authorize driver presence channel (for online status)
 */
Broadcast::channel('drivers.{driverId}.presence', function ($user, $driverId) {
    // Only the driver themselves can access their presence channel
    if ($user->driver && (int) $user->driver->id === (int) $driverId) {
        return [
            'id' => $user->id,
            'name' => $user->name,
        ];
    }

    return false;
});
