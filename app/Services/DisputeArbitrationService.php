<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\DrivingTelemetry;
use App\Models\PlatformTransaction;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\Notifications\NotificationService;

class DisputeArbitrationService
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Analyze driving telemetry and arbitrate dispute
     */
    public function arbitrateDispute(Booking $booking): array
    {
        // Get all telemetry data for this booking
        $telemetryData = DrivingTelemetry::where('booking_id', $booking->id)->get();

        if ($telemetryData->isEmpty()) {
            return [
                'success' => false,
                'reason' => 'No telemetry data available for analysis',
                'decision' => 'cannot_arbitrate',
            ];
        }

        // Analyze driving culture score
        $averageCultureScore = DrivingTelemetry::getAverageCultureScore($booking->id);
        $unsafeEventCount = DrivingTelemetry::getUnsafeEventCount($booking->id);

        // Calculate total unsafe events
        $totalUnsafeEvents = array_sum($unsafeEventCount);

        // Arbitration rules
        $safeDrivingThreshold = 85.0; // Culture score above 85 is considered safe
        $maxUnsafeEvents = 3; // Maximum allowed unsafe events

        $isSafeDriving = $averageCultureScore >= $safeDrivingThreshold && $totalUnsafeEvents <= $maxUnsafeEvents;

        $arbitrationResult = [
            'success' => true,
            'booking_id' => $booking->id,
            'average_culture_score' => $averageCultureScore,
            'unsafe_events' => $unsafeEventCount,
            'total_unsafe_events' => $totalUnsafeEvents,
            'is_safe_driving' => $isSafeDriving,
            'decision' => $isSafeDriving ? 'driver_favored' : 'employer_favored',
            'reason' => $isSafeDriving
                ? 'Telemetry data confirms safe driving behavior within acceptable G-force thresholds'
                : 'Telemetry data indicates unsafe driving patterns exceeding acceptable thresholds',
        ];

        // If driving is safe, automatically process arbitration payout
        if ($isSafeDriving && $booking->status === 'disputed') {
            $this->processArbitrationPayout($booking, $arbitrationResult);
        }

        return $arbitrationResult;
    }

    /**
     * Process arbitration payout to driver
     */
    protected function processArbitrationPayout(Booking $booking, array $arbitrationResult): void
    {
        DB::beginTransaction();

        try {
            // Update booking status
            $booking->update([
                'status' => 'completed',
                'completed_at' => now(),
                'metadata' => array_merge($booking->metadata ?? [], [
                    'arbitration_result' => $arbitrationResult,
                    'arbitration_timestamp' => now()->toISOString(),
                ]),
            ]);

            // Calculate driver payout
            $payoutAmount = $booking->agreed_rate;

            // Get driver's wallet
            $driver = $booking->driver;
            if ($driver && $driver->user) {
                $wallet = Wallet::firstOrCreate(
                    ['user_id' => $driver->user->id],
                    ['balance' => 0]
                );

                // Check subscription tier for payout clearance
                $subscription = $driver->user->activeSubscription;
                $clearanceHours = $subscription ? $subscription->getPayoutClearanceHours() : 48;

                if ($subscription && $subscription->hasInstantPayout()) {
                    // Instant payout for premium drivers
                    $wallet->increment('balance', $payoutAmount);

                    // Create platform transaction record
                    PlatformTransaction::create([
                        'user_id' => $driver->user->id,
                        'type' => 'payout',
                        'amount' => $payoutAmount,
                        'currency' => 'NGN',
                        'status' => 'completed',
                        'reference' => 'ARB-' . $booking->id . '-' . time(),
                        'metadata' => [
                            'booking_id' => $booking->id,
                            'arbitration' => true,
                            'instant_payout' => true,
                        ],
                    ]);

                    Log::info('Instant payout released via arbitration', [
                        'booking_id' => $booking->id,
                        'driver_id' => $driver->id,
                        'amount' => $payoutAmount,
                    ]);
                } else {
                    // Schedule payout for basic drivers (48-hour clearance)
                    PlatformTransaction::create([
                        'user_id' => $driver->user->id,
                        'type' => 'payout',
                        'amount' => $payoutAmount,
                        'currency' => 'NGN',
                        'status' => 'pending',
                        'reference' => 'ARB-' . $booking->id . '-' . time(),
                        'metadata' => [
                            'booking_id' => $booking->id,
                            'arbitration' => true,
                            'clearance_hours' => $clearanceHours,
                            'available_at' => now()->addHours($clearanceHours)->toISOString(),
                        ],
                    ]);

                    Log::info('Payout scheduled via arbitration', [
                        'booking_id' => $booking->id,
                        'driver_id' => $driver->id,
                        'amount' => $payoutAmount,
                        'clearance_hours' => $clearanceHours,
                    ]);
                }
            }

            DB::commit();

            if ($booking->hirer && $booking->hirer->user) {
                $this->notificationService->notifyEmployer($booking->hirer->user->phone_number ?? '0000', "Arbitration Decision: Dispute resolved in your favor.");
            }
            if ($booking->driver && $booking->driver->user) {
                $this->notificationService->notifyDriver($booking->driver->user->phone_number ?? '0000', "Arbitration Decision: A payout penalty was applied.");
            }
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to process arbitration payout', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get detailed telemetry analysis for a booking
     */
    public function getTelemetryAnalysis(Booking $booking): array
    {
        $telemetryData = DrivingTelemetry::where('booking_id', $booking->id)
            ->orderBy('recorded_at')
            ->get();

        if ($telemetryData->isEmpty()) {
            return [
                'has_data' => false,
                'message' => 'No telemetry data available',
            ];
        }

        $analysis = [
            'has_data' => true,
            'total_records' => $telemetryData->count(),
            'time_range' => [
                'start' => $telemetryData->first()->recorded_at,
                'end' => $telemetryData->last()->recorded_at,
            ],
            'culture_score' => [
                'average' => DrivingTelemetry::getAverageCultureScore($booking->id),
                'min' => $telemetryData->min('culture_score'),
                'max' => $telemetryData->max('culture_score'),
            ],
            'unsafe_events' => DrivingTelemetry::getUnsafeEventCount($booking->id),
            'speed_stats' => [
                'average_kmh' => $telemetryData->avg('speed_kmh'),
                'max_kmh' => $telemetryData->max('speed_kmh'),
            ],
            'acceleration_stats' => [
                'avg_x' => $telemetryData->avg('acceleration_x'),
                'avg_y' => $telemetryData->avg('acceleration_y'),
                'avg_z' => $telemetryData->avg('acceleration_z'),
                'max_x' => $telemetryData->max('acceleration_x'),
                'max_y' => $telemetryData->max('acceleration_y'),
                'max_z' => $telemetryData->max('acceleration_z'),
            ],
        ];

        return $analysis;
    }

    /**
     * Check if a booking is eligible for arbitration
     */
    public function isEligibleForArbitration(Booking $booking): bool
    {
        // Must be in disputed status
        if ($booking->status !== 'disputed') {
            return false;
        }

        // Must have telemetry data
        $hasTelemetry = DrivingTelemetry::where('booking_id', $booking->id)->exists();
        if (!$hasTelemetry) {
            return false;
        }

        // Must be completed (trip ended)
        if (!$booking->completed_at) {
            return false;
        }

        // Must be funded (escrow locked)
        if (!$booking->funded_at) {
            return false;
        }

        return true;
    }

    /**
     * Process all eligible disputed bookings for arbitration
     */
    public function processDisputedBookings(): array
    {
        $disputedBookings = Booking::where('status', 'disputed')
            ->whereNotNull('completed_at')
            ->whereNotNull('funded_at')
            ->get();

        $results = [
            'total_processed' => 0,
            'driver_favored' => 0,
            'employer_favored' => 0,
            'cannot_arbitrate' => 0,
            'details' => [],
        ];

        foreach ($disputedBookings as $booking) {
            try {
                $result = $this->arbitrateDispute($booking);
                $results['total_processed']++;
                $results['details'][] = [
                    'booking_id' => $booking->id,
                    'result' => $result,
                ];

                if ($result['decision'] === 'driver_favored') {
                    $results['driver_favored']++;
                } elseif ($result['decision'] === 'employer_favored') {
                    $results['employer_favored']++;
                } else {
                    $results['cannot_arbitrate']++;
                }
            } catch (\Exception $e) {
                Log::error('Failed to arbitrate booking', [
                    'booking_id' => $booking->id,
                    'error' => $e->getMessage(),
                ]);
                $results['details'][] = [
                    'booking_id' => $booking->id,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }
}
