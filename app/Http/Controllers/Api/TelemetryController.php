<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TelemetryService;
use App\Events\TelemetryUpdated;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TelemetryController extends Controller
{
    protected TelemetryService $telemetryService;

    public function __construct(TelemetryService $telemetryService)
    {
        $this->telemetryService = $telemetryService;
    }

    /**
     * Get comprehensive system telemetry
     */
    public function index(): JsonResponse
    {
        $telemetry = $this->telemetryService->getSystemTelemetry();

        return response()->json([
            'success' => true,
            'data' => $telemetry,
        ]);
    }

    /**
     * Get real-time metrics
     */
    public function realtime(): JsonResponse
    {
        $metrics = $this->telemetryService->getRealtimeMetrics();

        return response()->json([
            'success' => true,
            'data' => $metrics,
        ]);
    }

    /**
     * Get historical metrics for charts
     */
    public function historical(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'nullable|in:24hours,7days,30days,90days',
        ]);

        $period = $request->input('period', '7days');
        $metrics = $this->telemetryService->getHistoricalMetrics($period);

        return response()->json([
            'success' => true,
            'data' => $metrics,
            'period' => $period,
        ]);
    }

    /**
     * Get driver-specific metrics
     */
    public function drivers(): JsonResponse
    {
        $metrics = $this->telemetryService->getDriverMetrics();

        return response()->json([
            'success' => true,
            'data' => $metrics,
        ]);
    }

    /**
     * Get job-specific metrics
     */
    public function jobs(): JsonResponse
    {
        $metrics = $this->telemetryService->getJobMetrics();

        return response()->json([
            'success' => true,
            'data' => $metrics,
        ]);
    }

    /**
     * Get financial metrics
     */
    public function financials(): JsonResponse
    {
        $metrics = $this->telemetryService->getFinancialMetrics();

        return response()->json([
            'success' => true,
            'data' => $metrics,
        ]);
    }

    /**
     * Ingest driving telemetry data securely
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'speed_kmh' => 'nullable|numeric',
            'acceleration_x' => 'nullable|numeric',
            'acceleration_y' => 'nullable|numeric',
            'acceleration_z' => 'nullable|numeric',
            'hard_braking' => 'boolean',
            'aggressive_cornering' => 'boolean',
            'speeding' => 'boolean',
        ]);

        $booking = \Illuminate\Support\Facades\DB::table('bookings')->find($request->booking_id);

        // 1. Enforce Shift-Fence Tracking Bounds
        if (in_array($booking->contract_type, ['monthly', 'yearly'])) {
            $now = now()->format('H:i:s');
            if ($booking->shift_start_time && $booking->shift_end_time) {
                if ($now < $booking->shift_start_time || $now > $booking->shift_end_time) {
                    // Drop telemetry silently to enforce strict privacy outside of hours
                    return response()->json(['status' => 'dropped', 'reason' => 'Outside shift fence'], 202);
                }
            }
        }

        // 2. Proactive Culture Breach Intercept
        $cultureBreach = false;
        if ($request->hard_braking || $request->aggressive_cornering || abs($request->acceleration_x) > 0.8 || abs($request->acceleration_y) > 0.8) {
            $cultureBreach = true;
            
            \Illuminate\Support\Facades\DB::table('driver_incidents')->insert([
                'driver_id' => $request->user()->id ?? $booking->driver_id,
                'incident_type' => 'CULTURE_BREACH',
                'severity' => 'HIGH',
                'details' => json_encode(['telemetry' => $request->all(), 'reason' => 'Aggressive driving detected']),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        \Illuminate\Support\Facades\DB::table('driving_telemetry')->insert([
            'booking_id' => $booking->id,
            'driver_id' => $request->user()->id ?? $booking->driver_id,
            'recorded_at' => now(),
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'speed_kmh' => $request->speed_kmh,
            'acceleration_x' => $request->acceleration_x,
            'acceleration_y' => $request->acceleration_y,
            'acceleration_z' => $request->acceleration_z,
            'hard_braking' => $request->hard_braking ?? false,
            'aggressive_cornering' => $request->aggressive_cornering ?? false,
            'speeding' => $request->speeding ?? false,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Security Audit Logging using spatie/laravel-activitylog
        activity('mobile_api')
            ->causedBy($request->user())
            ->withProperties([
                'booking_id' => $booking->id, 
                'lat' => $request->latitude, 
                'lng' => $request->longitude,
                'device_model' => $request->header('User-Agent'),
                'app_version' => $request->header('X-App-Version', 'unknown')
            ])
            ->event('gps_ping')
            ->log('Mobile device GPS ping ingested');

        // 3. Broadcast real-time telemetry to authorized hirers
        broadcast(new TelemetryUpdated($booking->id, $request->all()))->toOthers();

        return response()->json([
            'status' => 'recorded',
            'culture_breach_flagged' => $cultureBreach
        ], 201);
    }
}
