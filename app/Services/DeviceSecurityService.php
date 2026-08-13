<?php

namespace App\Services;

use App\Models\User;
use App\Models\Blacklist;
use Illuminate\Support\Facades\Log;

class DeviceSecurityService
{
    /**
     * Process device security scan results from mobile app
     */
    public function processSecurityScan(User $user, array $scanData): array
    {
        $securityViolations = [];
        $shouldBlacklist = false;

        // Check for mock location enabled
        if (isset($scanData['mock_location_enabled']) && $scanData['mock_location_enabled']) {
            $securityViolations[] = 'mock_location';
            $user->update(['mock_location_detected' => true]);
            $shouldBlacklist = true;
        }

        // Check for root/jailbreak
        if (isset($scanData['root_jailbreak_detected']) && $scanData['root_jailbreak_detected']) {
            $securityViolations[] = 'root_jailbreak';
            $user->update(['root_jailbreak_detected' => true]);
            $shouldBlacklist = true;
        }

        // Check for GPS spoofing apps
        if (isset($scanData['gps_spoofing_detected']) && $scanData['gps_spoofing_detected']) {
            $securityViolations[] = 'gps_spoofing';
            $user->update(['gps_spoofing_detected' => true]);
            $shouldBlacklist = true;
        }

        // Update security scan timestamp
        $user->update([
            'last_security_scan_at' => now(),
            'security_notes' => isset($scanData['notes']) ? $scanData['notes'] : null,
        ]);

        // If serious violations detected, blacklist the device
        if ($shouldBlacklist) {
            $this->handleSecurityViolation($user, $securityViolations, $scanData);
        }

        return [
            'violations_detected' => $securityViolations,
            'should_blacklist' => $shouldBlacklist,
            'security_scan_at' => $user->last_security_scan_at,
        ];
    }

    /**
     * Handle security violation - blacklist device and user
     */
    protected function handleSecurityViolation(User $user, array $violations, array $scanData): void
    {
        Log::critical('Security violation detected', [
            'user_id' => $user->id,
            'violations' => $violations,
            'scan_data' => $scanData,
        ]);

        // Blacklist device IMEI if available
        if ($user->device_imei) {
            Blacklist::blacklistEntity(
                'device',
                $user->device_imei,
                'Security violation: ' . implode(', ', $violations),
                'permanent',
                $user->id,
                null,
                json_encode($scanData)
            );
        }

        // Blacklist device fingerprint if available
        if ($user->device_fingerprint) {
            Blacklist::blacklistEntity(
                'device',
                $user->device_fingerprint,
                'Security violation: ' . implode(', ', $violations),
                'permanent',
                $user->id,
                null,
                json_encode($scanData)
            );
        }

        // Blacklist Google account if available
        if ($user->google_id) {
            Blacklist::blacklistEntity(
                'google_account',
                $user->google_id,
                'Security violation: ' . implode(', ', $violations),
                'permanent',
                $user->id,
                null,
                json_encode($scanData)
            );
        }

        // Terminate all active bookings for this user
        if ($user->driver) {
            $user->driver->bookings()
                ->whereIn('status', ['funded', 'in_progress'])
                ->each(function ($booking) {
                    $booking->update([
                        'status' => 'security_breach',
                        'cancellation_reason' => 'Device security violation detected',
                        'cancelled_at' => now(),
                    ]);
                    $booking->terminateTelemetryChannel();
                });
        }
    }

    /**
     * Check if user is allowed to continue based on security status
     */
    public function isUserSecurityCompliant(User $user): bool
    {
        // Check if user has any security violations
        if ($user->mock_location_detected || $user->root_jailbreak_detected || $user->gps_spoofing_detected) {
            return false;
        }

        // Check if user's device is blacklisted
        if ($user->device_imei && Blacklist::isBlacklisted('device', $user->device_imei)) {
            return false;
        }

        if ($user->device_fingerprint && Blacklist::isBlacklisted('device', $user->device_fingerprint)) {
            return false;
        }

        if ($user->google_id && Blacklist::isBlacklisted('google_account', $user->google_id)) {
            return false;
        }

        return true;
    }

    /**
     * Get security status for user
     */
    public function getSecurityStatus(User $user): array
    {
        return [
            'mock_location_detected' => $user->mock_location_detected,
            'root_jailbreak_detected' => $user->root_jailbreak_detected,
            'gps_spoofing_detected' => $user->gps_spoofing_detected,
            'last_security_scan_at' => $user->last_security_scan_at,
            'device_imei_blacklisted' => $user->device_imei ? Blacklist::isBlacklisted('device', $user->device_imei) : false,
            'device_fingerprint_blacklisted' => $user->device_fingerprint ? Blacklist::isBlacklisted('device', $user->device_fingerprint) : false,
            'google_account_blacklisted' => $user->google_id ? Blacklist::isBlacklisted('google_account', $user->google_id) : false,
            'is_compliant' => $this->isUserSecurityCompliant($user),
        ];
    }
}
