<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\DriverDocument;
use App\Models\User;
use App\Notifications\DocumentExpiringSoon;
use App\Notifications\DocumentExpired;
use App\Notifications\MissingDocumentsReminder;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DocumentNotificationService
{
    /**
     * Check and send notifications for expiring documents
     */
    public function checkExpiringDocuments(): array
    {
        $results = [
            'notified' => 0,
            'skipped' => 0,
            'errors' => [],
        ];

        // Get documents expiring in 30, 14, and 7 days
        $warningPeriods = [30, 14, 7];

        foreach ($warningPeriods as $days) {
            $expiringDocuments = DriverDocument::where('status', 'approved')
                ->where('expiry_date', '<=', Carbon::now()->addDays($days))
                ->where('expiry_date', '>', Carbon::now())
                ->whereDoesntHave('notifications', function ($query) use ($days) {
                    $query->where('type', 'App\Notifications\DocumentExpiringSoon')
                        ->where('created_at', '>=', Carbon::now()->subDays($days / 2));
                })
                ->with('driver.user')
                ->get();

            foreach ($expiringDocuments as $document) {
                try {
                    $document->driver->user->notify(new DocumentExpiringSoon($document, $days));
                    $results['notified']++;
                    
                    Log::info('Document expiry notification sent', [
                        'document_id' => $document->id,
                        'driver_id' => $document->driver_id,
                        'days_remaining' => $days,
                    ]);
                } catch (\Exception $e) {
                    $results['errors'][] = [
                        'document_id' => $document->id,
                        'error' => $e->getMessage(),
                    ];
                    $results['skipped']++;
                }
            }
        }

        return $results;
    }

    /**
     * Check and send notifications for expired documents
     */
    public function checkExpiredDocuments(): array
    {
        $results = [
            'notified' => 0,
            'skipped' => 0,
            'errors' => [],
        ];

        $expiredDocuments = DriverDocument::where('status', 'approved')
            ->where('expiry_date', '<', Carbon::now()->subDay())
            ->whereDoesntHave('notifications', function ($query) {
                $query->where('type', 'App\Notifications\DocumentExpired')
                    ->where('created_at', '>=', Carbon::now()->subDay());
            })
            ->with('driver.user')
            ->get();

        foreach ($expiredDocuments as $document) {
            try {
                $document->driver->user->notify(new DocumentExpired($document));
                $results['notified']++;
                
                // Update document status to expired
                $document->update(['status' => 'expired']);
                
                Log::info('Document expired notification sent', [
                    'document_id' => $document->id,
                    'driver_id' => $document->driver_id,
                ]);
            } catch (\Exception $e) {
                $results['errors'][] = [
                    'document_id' => $document->id,
                    'error' => $e->getMessage(),
                ];
                $results['skipped']++;
            }
        }

        return $results;
    }

    /**
     * Send reminders for missing documents
     */
    public function sendMissingDocumentReminders(): array
    {
        $results = [
            'notified' => 0,
            'skipped' => 0,
            'errors' => [],
        ];

        // Get drivers who are not fully verified
        $drivers = Driver::where('is_verified', false)
            ->where('status', '!=', 'blacklisted')
            ->whereHas('user')
            ->with('user', 'documents')
            ->get();

        foreach ($drivers as $driver) {
            $missingDocs = $this->getMissingDocuments($driver);
            
            if (empty($missingDocs)) {
                continue;
            }

            // Check if we've already sent a reminder in the last 7 days
            $lastReminder = $driver->user->notifications()
                ->where('type', 'App\Notifications\MissingDocumentsReminder')
                ->where('created_at', '>=', Carbon::now()->subDays(7))
                ->exists();

            if ($lastReminder) {
                $results['skipped']++;
                continue;
            }

            try {
                $driver->user->notify(new MissingDocumentsReminder($driver, $missingDocs));
                $results['notified']++;
                
                Log::info('Missing documents reminder sent', [
                    'driver_id' => $driver->id,
                    'missing_count' => count($missingDocs),
                ]);
            } catch (\Exception $e) {
                $results['errors'][] = [
                    'driver_id' => $driver->id,
                    'error' => $e->getMessage(),
                ];
                $results['skipped']++;
            }
        }

        return $results;
    }

    /**
     * Get missing documents for a driver
     */
    protected function getMissingDocuments(Driver $driver): array
    {
        $requiredDocuments = [
            'drivers_license' => 'Driver\'s License',
            'medical_certificate' => 'Medical Certificate',
            'police_clearance' => 'Police Clearance',
            'insurance' => 'Vehicle Insurance',
            'vehicle_registration' => 'Vehicle Registration',
            'guarantor_form_a' => 'Guarantor Form A',
            'guarantor_form_b' => 'Guarantor Form B',
        ];

        $uploadedDocuments = $driver->documents()
            ->whereIn('status', ['pending', 'approved'])
            ->pluck('document_type')
            ->toArray();

        $missing = [];
        foreach ($requiredDocuments as $type => $name) {
            if (!in_array($type, $uploadedDocuments)) {
                $missing[] = [
                    'type' => $type,
                    'name' => $name,
                    'required' => in_array($type, ['drivers_license', 'police_clearance']),
                ];
            }
        }

        return $missing;
    }

    /**
     * Get notification summary for admin dashboard
     */
    public function getAdminNotificationSummary(): array
    {
        $pendingDocuments = DriverDocument::where('status', 'pending')->count();
        $expiringDocuments = DriverDocument::where('status', 'approved')
            ->where('expiry_date', '<=', Carbon::now()->addDays(30))
            ->where('expiry_date', '>', Carbon::now())
            ->count();
        $expiredDocuments = DriverDocument::where('status', 'approved')
            ->where('expiry_date', '<', Carbon::now())
            ->count();
        $pendingDrivers = Driver::where('is_verified', false)->count();

        return [
            'pending_documents' => $pendingDocuments,
            'expiring_documents' => $expiringDocuments,
            'expired_documents' => $expiredDocuments,
            'pending_drivers' => $pendingDrivers,
            'total_alerts' => $pendingDocuments + $expiringDocuments + $expiredDocuments + $pendingDrivers,
        ];
    }

    /**
     * Run all document notification checks
     */
    public function runAllChecks(): array
    {
        return [
            'expiring' => $this->checkExpiringDocuments(),
            'expired' => $this->checkExpiredDocuments(),
            'missing' => $this->sendMissingDocumentReminders(),
            'summary' => $this->getAdminNotificationSummary(),
        ];
    }
}
