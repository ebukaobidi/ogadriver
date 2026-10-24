<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Dispute;
use App\Models\TransportJob;
use App\Models\Message;
use App\Models\DriverLocation;

class DisputeDashboardController extends Controller
{
    /**
     * Get aggregated data for a specific dispute to power the 3-pane dashboard.
     */
    public function show($id)
    {
        // 1. Fetch Dispute with related Job (which brings in hirer and driver)
        $dispute = Dispute::with([
            'job.hirer.user',
            'job.driver.user'
        ])->findOrFail($id);

        $job = $dispute->job;
        if (!$job) {
            return response()->json(['error' => 'Job not found for this dispute.'], 404);
        }

        // 2. Fetch Chat Messages between Hirer and Driver for this Job context
        // Assuming messages are between the hirer user and driver user
        $messages = Message::where(function($q) use ($job) {
            $q->where('sender_id', $job->hirer->user_id)
              ->where('receiver_id', $job->driver->user_id);
        })->orWhere(function($q) use ($job) {
            $q->where('sender_id', $job->driver->user_id)
              ->where('receiver_id', $job->hirer->user_id);
        })
        ->orderBy('created_at', 'asc')
        ->get();

        // 3. Fetch Telemetry / Location History for the driver during the job
        // To prevent massive payloads, we just get the latest 50 location points during the job's timeframe
        $telemetry = DriverLocation::where('driver_id', $job->driver_id)
            ->where('updated_at', '>=', $job->created_at)
            ->orderBy('updated_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'dispute' => $dispute,
                'job' => $job,
                'messages' => $messages,
                'telemetry' => $telemetry
            ]
        ]);
    }
}
