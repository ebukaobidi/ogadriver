<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TransportJob;
use App\Models\DrivingTelemetry;
use Illuminate\Http\Request;

class AdminTelemetryController extends Controller
{
    public function index(Request $request)
    {
        // Live nodes plotting - Pulling from real telemetry and locations
        $activeJobs = TransportJob::with(['driver.user', 'latestLocation'])
            ->whereIn('status', ['assigned', 'in_progress'])
            ->get();

        $activeBookings = \App\Models\Booking::with(['driver.user', 'latestTelemetry'])
            ->whereIn('status', ['confirmed', 'started', 'in_progress'])
            ->get();

        $jobNodes = $activeJobs->map(function ($job) {
            $latest = $job->latestLocation;
            return [
                'id' => 'JOB-' . str_pad($job->id, 4, '0', STR_PAD_LEFT),
                'operative' => $job->driver && $job->driver->user ? $job->driver->user->name : 'Unknown Operative',
                'contract' => 'CON-' . str_pad($job->id, 4, '0', STR_PAD_LEFT),
                'location' => $latest ? $latest->latitude . ', ' . $latest->longitude : ($job->pickup_location ?? 'In Transit'),
                'speed' => 'Tracking Active',
                'status' => $job->status === 'in_progress' ? 'Active' : 'Waiting',
                'latency' => $latest ? max(0, now()->diffInSeconds($latest->recorded_at)) . 's' : 'N/A',
                'lastPing' => $latest ? $latest->recorded_at->diffForHumans() : 'No ping',
                'device' => 'Standard Client'
            ];
        });

        $bookingNodes = $activeBookings->map(function ($booking) {
            $latest = $booking->latestTelemetry;
            return [
                'id' => 'BKG-' . str_pad($booking->id, 4, '0', STR_PAD_LEFT),
                'operative' => $booking->driver && $booking->driver->user ? $booking->driver->user->name : 'Unknown Operative',
                'contract' => 'BKG-' . str_pad($booking->id, 4, '0', STR_PAD_LEFT),
                'location' => $latest ? $latest->latitude . ', ' . $latest->longitude : ($booking->pickup_location ?? 'In Transit'),
                'speed' => ($latest ? round($latest->speed_kmh) : 0) . ' km/h',
                'status' => $booking->status === 'in_progress' ? 'Active' : 'Waiting',
                'latency' => $latest ? max(0, now()->diffInSeconds($latest->recorded_at)) . 's' : 'N/A',
                'lastPing' => $latest ? $latest->recorded_at->diffForHumans() : 'No ping',
                'device' => 'Advanced Telemetry'
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'liveNodes' => $jobNodes->merge($bookingNodes)
            ]
        ]);
    }

    public function incidents(Request $request)
    {
        try {
            // Query real driving telemetry that flagged any unsafe events
            $query = DrivingTelemetry::with(['driver.user', 'booking.hirer.user'])
                ->where(function($q) {
                    $q->where('hard_braking', true)
                      ->orWhere('aggressive_cornering', true)
                      ->orWhere('speeding', true);
                });

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->whereHas('driver.user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('booking', function($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%");
                });
            }

            $paginated = $query->orderBy('recorded_at', 'desc')->paginate(10);

            $paginated->through(function ($telemetry) {
                $type = 'Unsafe Driving';
                $severity = 'Medium';
                $details = 'Multiple infractions detected.';

                if ($telemetry->speeding) {
                    $type = 'Speeding';
                    $severity = 'Critical';
                    $details = 'Operative exceeded maximum speed limits (Recorded: ' . $telemetry->speed_kmh . 'km/h).';
                } elseif ($telemetry->hard_braking) {
                    $type = 'Hard Braking';
                    $severity = 'High';
                    $details = 'Severe negative acceleration detected.';
                } elseif ($telemetry->aggressive_cornering) {
                    $type = 'Aggressive Cornering';
                    $severity = 'Medium';
                    $details = 'High lateral acceleration detected in transit zone.';
                }

                return [
                    'id' => 'INC-' . str_pad($telemetry->id, 4, '0', STR_PAD_LEFT),
                    'operative' => $telemetry->driver && $telemetry->driver->user ? $telemetry->driver->user->name : 'Unknown Operative',
                    'employer' => $telemetry->booking && $telemetry->booking->hirer && $telemetry->booking->hirer->user ? $telemetry->booking->hirer->user->name : 'Unknown Employer',
                    'contract' => $telemetry->booking ? 'CON-' . str_pad($telemetry->booking->id, 4, '0', STR_PAD_LEFT) : 'N/A',
                    'type' => $type,
                    'severity' => $severity,
                    'time' => $telemetry->recorded_at ? $telemetry->recorded_at->format('Y-m-d H:i') : 'N/A',
                    'location' => $telemetry->latitude && $telemetry->longitude ? $telemetry->latitude . ', ' . $telemetry->longitude : 'Tracking Active',
                    'details' => $details,
                    'status' => 'Investigating'
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $paginated
            ]);
        } catch (\Exception $e) {
            // Return empty data if table doesn't exist or other error
            return response()->json([
                'status' => 'success',
                'data' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 10,
                    'total' => 0
                ]
            ]);
        }
    }
}
