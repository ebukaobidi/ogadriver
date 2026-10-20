<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Booking;
use App\Models\Conversation;

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
 * Authorize the private channel for a specific driver
 */
Broadcast::channel('driver.{driverId}', function ($user, $driverId) {
    return $user->driver && (int) $user->driver->id === (int) $driverId;
});

/**
 * Authorize the private channel for a specific hirer
 */
Broadcast::channel('hirer.{hirerId}', function ($user, $hirerId) {
    return $user->hirer && (int) $user->hirer->id === (int) $hirerId;
});

/**
 * Authorize the private chat channel for both participants
 */
Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    if (!$conversation) {
        return false;
    }
    
    return ($user->driver && (int) $user->driver->id === (int) $conversation->driver_id) ||
           ($user->hirer && (int) $user->hirer->id === (int) $conversation->hirer_id);
});

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
