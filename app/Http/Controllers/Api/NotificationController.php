<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\DocumentNotificationService;
use App\Models\DriverDocument;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class NotificationController extends Controller
{
    protected DocumentNotificationService $notificationService;

    public function __construct(DocumentNotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Get all unread notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'unread_count' => $user->unreadNotifications()->count(),
                'notifications' => $user->notifications()->take(50)->get(),
            ]
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->find($id);

        if ($notification) {
            $notification->markAsRead();
            return response()->json(['status' => 'success']);
        }

        return response()->json(['status' => 'error', 'message' => 'Notification not found'], 404);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['status' => 'success']);
    }

    /**
     * Get document-specific alerts for the authenticated user
     */
    public function getDocumentAlerts(Request $request)
    {
        $user = $request->user();
        
        if (!$user->driver) {
            return response()->json([
                'status' => 'success',
                'data' => [
                    'expiring_documents' => [],
                    'expired_documents' => [],
                    'total_expiring' => 0,
                    'total_expired' => 0,
                ]
            ]);
        }

        $driver = $user->driver;
        
        // Get expiring documents (within 30 days)
        $expiringDocuments = DriverDocument::where('driver_id', $driver->id)
            ->where('status', 'approved')
            ->where('expiry_date', '<=', Carbon::now()->addDays(30))
            ->where('expiry_date', '>', Carbon::now())
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'document_type' => $doc->document_type,
                    'expiry_date' => $doc->expiry_date->format('Y-m-d'),
                    'days_remaining' => $doc->expiry_date->diffInDays(Carbon::now()),
                    'file_url' => $doc->file_url ?? Storage::url($doc->file_path),
                ];
            })
            ->toArray();

        // Get expired documents
        $expiredDocuments = DriverDocument::where('driver_id', $driver->id)
            ->where('status', 'approved')
            ->where('expiry_date', '<', Carbon::now())
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'document_type' => $doc->document_type,
                    'expiry_date' => $doc->expiry_date->format('Y-m-d'),
                    'days_expired' => Carbon::now()->diffInDays($doc->expiry_date),
                    'file_url' => $doc->file_url ?? Storage::url($doc->file_path),
                ];
            })
            ->toArray();

        return response()->json([
            'status' => 'success',
            'data' => [
                'driver_id' => $driver->id,
                'expiring_documents' => $expiringDocuments,
                'expired_documents' => $expiredDocuments,
                'total_expiring' => count($expiringDocuments),
                'total_expired' => count($expiredDocuments),
            ]
        ]);
    }

    /**
     * Update FCM token for push notifications
     */
    public function updateFcmToken(Request $request)
    {
        $request->validate([
            'fcm_token' => 'required|string',
        ]);

        $user = $request->user();
        $user->update(['fcm_token' => $request->fcm_token]);

        return response()->json([
            'status' => 'success',
            'message' => 'FCM token updated successfully'
        ]);
    }
}
