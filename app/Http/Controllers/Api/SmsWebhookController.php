<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Driver;
use App\Models\TransportJob;
use App\Services\DriverLocationService;
use Illuminate\Support\Facades\Log;

class SmsWebhookController extends Controller
{
    /**
     * Termii SMS Webhook for Offline Mesh Tracking
     */
    public function handleIncoming(Request $request): JsonResponse
    {
        // Example Termii Webhook Payload
        // { "to": "2348000", "from": "2349000", "message": "OGA-LOC: 6.52,-3.37:JOB102" }
        
        $message = $request->input('message');
        $fromPhone = $request->input('from');

        if (str_starts_with($message, 'OGA-LOC:')) {
            // Parse: OGA-LOC: lat,lng:JOBID
            $content = str_replace('OGA-LOC:', '', $message);
            $parts = explode(':', trim($content));
            
            if (count($parts) === 2) {
                $coords = explode(',', trim($parts[0]));
                $jobStr = trim($parts[1]); // e.g. JOB102
                $jobId = (int) str_replace('JOB', '', $jobStr);
                
                if (count($coords) === 2) {
                    $lat = (float) $coords[0];
                    $lng = (float) $coords[1];
                    
                    // Find driver by job
                    $job = \App\Models\TransportJob::find($jobId);
                    if ($job && $job->driver_id) {
                        // Manually inject offline location into Redis via Service
                        $locationService = app(DriverLocationService::class);
                        $locationService->updateDriverLocation($job->driver_id, $lat, $lng, 'on_trip');
                        
                        Log::info("OFFLINE MESH: Updated driver {$job->driver_id} location via SMS.");
                        
                        return response()->json(['status' => 'success']);
                    }
                }
            }
        }

        return response()->json(['status' => 'ignored']);
    }
}
