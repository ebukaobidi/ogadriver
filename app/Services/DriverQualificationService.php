<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\Dispute;
use App\Models\Review;

class DriverQualificationService
{
    /**
     * Minimum qualification thresholds for Hybrid tier
     * Simplified for faster tier progression in long-term hire model
     */
    private const MIN_RATING = 4.0;
    private const MIN_COMPLETED_JOBS = 30;
    private const MIN_COMPLETION_RATE = 90; // percentage
    private const MAX_SERIOUS_COMPLAINTS = 0;
    private const MIN_EXPERIENCE_MONTHS = 3;

    /**
     * Check if driver qualifies for Hybrid tier
     */
    public function qualifiesForHybrid(int $driverId): array
    {
        $driver = Driver::with(['reviews', 'disputes'])->findOrFail($driverId);

        $qualification = [
            'qualified' => true,
            'reasons' => [],
            'metrics' => $this->getQualificationMetrics($driver),
        ];

        // Check rating threshold
        if ($driver->rating < self::MIN_RATING) {
            $qualification['qualified'] = false;
            $qualification['reasons'][] = "Rating must be at least " . self::MIN_RATING . " (current: " . $driver->rating . ")";
        }

        // Check completed jobs threshold
        if ($driver->total_jobs < self::MIN_COMPLETED_JOBS) {
            $qualification['qualified'] = false;
            $qualification['reasons'][] = "Must have completed at least " . self::MIN_COMPLETED_JOBS . " jobs (current: " . $driver->total_jobs . ")";
        }

        // Check completion rate
        $completionRate = $this->calculateCompletionRate($driver);
        if ($completionRate < self::MIN_COMPLETION_RATE) {
            $qualification['qualified'] = false;
            $qualification['reasons'][] = "Completion rate must be at least " . self::MIN_COMPLETION_RATE . "% (current: " . $completionRate . "%)";
        }

        // Check serious complaints
        $seriousComplaints = $this->countSeriousComplaints($driver);
        if ($seriousComplaints > self::MAX_SERIOUS_COMPLAINTS) {
            $qualification['qualified'] = false;
            $qualification['reasons'][] = "Must have zero serious complaints (current: " . $seriousComplaints . ")";
        }

        // Check experience
        $experienceMonths = $this->calculateExperienceMonths($driver);
        if ($experienceMonths < self::MIN_EXPERIENCE_MONTHS) {
            $qualification['qualified'] = false;
            $qualification['reasons'][] = "Must have at least " . self::MIN_EXPERIENCE_MONTHS . " months experience (current: " . $experienceMonths . ")";
        }

        return $qualification;
    }

    /**
     * Get qualification metrics for a driver
     */
    public function getQualificationMetrics(Driver $driver): array
    {
        return [
            'rating' => $driver->rating,
            'min_rating_required' => self::MIN_RATING,
            'total_jobs' => $driver->total_jobs,
            'min_jobs_required' => self::MIN_COMPLETED_JOBS,
            'completion_rate' => $this->calculateCompletionRate($driver),
            'min_completion_rate_required' => self::MIN_COMPLETION_RATE,
            'serious_complaints' => $this->countSeriousComplaints($driver),
            'max_complaints_allowed' => self::MAX_SERIOUS_COMPLAINTS,
            'experience_months' => $this->calculateExperienceMonths($driver),
            'min_experience_months_required' => self::MIN_EXPERIENCE_MONTHS,
            'average_review_score' => $this->getAverageReviewScore($driver),
        ];
    }

    /**
     * Calculate job completion rate
     */
    private function calculateCompletionRate(Driver $driver): float
    {
        $totalJobs = $driver->jobs()->count();
        if ($totalJobs === 0) {
            return 0;
        }

        $completedJobs = $driver->jobs()->where('status', 'completed')->count();
        return round(($completedJobs / $totalJobs) * 100, 2);
    }

    /**
     * Count serious complaints against driver
     */
    private function countSeriousComplaints(Driver $driver): int
    {
        return $driver->disputes()
            ->where('severity', 'serious')
            ->where('status', '!=', 'resolved_in_favor_of_driver')
            ->count();
    }

    /**
     * Calculate driver experience in months
     */
    private function calculateExperienceMonths(Driver $driver): int
    {
        if (!$driver->created_at) {
            return 0;
        }

        return $driver->created_at->diffInMonths(now());
    }

    /**
     * Get average review score
     */
    private function getAverageReviewScore(Driver $driver): float
    {
        return $driver->reviews()->avg('rating') ?? 0;
    }

    /**
     * Upgrade driver to Hybrid tier if qualified
     */
    public function upgradeToHybrid(int $driverId): Driver
    {
        $qualification = $this->qualifiesForHybrid($driverId);

        if (!$qualification['qualified']) {
            throw new \InvalidArgumentException('Driver does not qualify for Hybrid tier: ' . implode(', ', $qualification['reasons']));
        }

        $driver = Driver::findOrFail($driverId);

        // Update driver to Hybrid tier
        $driver->update([
            'subscription_tier' => 'driver_hybrid',
        ]);

        return $driver;
    }

    /**
     * Downgrade driver from Hybrid tier
     */
    public function downgradeFromHybrid(int $driverId, string $reason): Driver
    {
        $driver = Driver::findOrFail($driverId);

        if ($driver->subscription_tier !== 'driver_hybrid') {
            throw new \InvalidArgumentException('Driver is not currently on Hybrid tier');
        }

        $driver->update([
            'subscription_tier' => 'driver_basic',
        ]);

        // Log the downgrade reason
        // This could be stored in a separate audit log table

        return $driver;
    }

    /**
     * Check and downgrade drivers who no longer qualify for Hybrid
     * For scheduled task
     */
    public function enforceHybridQualification(): array
    {
        $hybridDrivers = Driver::where('subscription_tier', 'driver_hybrid')->get();

        $downgraded = [];
        foreach ($hybridDrivers as $driver) {
            $qualification = $this->qualifiesForHybrid($driver->id);

            if (!$qualification['qualified']) {
                $this->downgradeFromHybrid($driver->id, 'No longer meets qualification criteria');
                $downgraded[] = [
                    'driver_id' => $driver->id,
                    'reasons' => $qualification['reasons'],
                ];
            }
        }

        return [
            'checked' => $hybridDrivers->count(),
            'downgraded' => count($downgraded),
            'details' => $downgraded,
        ];
    }

    /**
     * Get drivers approaching Hybrid qualification
     */
    public function getDriversApproachingQualification(int $limit = 10): array
    {
        $drivers = Driver::where('subscription_tier', '!=', 'driver_hybrid')
            ->where('is_verified', true)
            ->where('status', 'active')
            ->get();

        $approaching = [];
        foreach ($drivers as $driver) {
            $metrics = $this->getQualificationMetrics($driver);
            $score = $this->calculateQualificationScore($metrics);

            if ($score >= 70) { // 70% of the way there
                $approaching[] = [
                    'driver_id' => $driver->id,
                    'name' => $driver->user->name ?? 'Unknown',
                    'current_tier' => $driver->subscription_tier,
                    'qualification_score' => $score,
                    'metrics' => $metrics,
                ];
            }
        }

        // Sort by score descending
        usort($approaching, function ($a, $b) {
            return $b['qualification_score'] <=> $a['qualification_score'];
        });

        return array_slice($approaching, 0, $limit);
    }

    /**
     * Calculate overall qualification score (0-100)
     */
    private function calculateQualificationScore(array $metrics): float
    {
        $score = 0;

        // Rating score (25% weight)
        $ratingScore = ($metrics['rating'] / self::MIN_RATING) * 25;
        $score += min($ratingScore, 25);

        // Jobs score (25% weight)
        $jobsScore = ($metrics['total_jobs'] / self::MIN_COMPLETED_JOBS) * 25;
        $score += min($jobsScore, 25);

        // Completion rate score (25% weight)
        $completionScore = ($metrics['completion_rate'] / self::MIN_COMPLETION_RATE) * 25;
        $score += min($completionScore, 25);

        // Experience score (25% weight)
        $experienceScore = ($metrics['experience_months'] / self::MIN_EXPERIENCE_MONTHS) * 25;
        $score += min($experienceScore, 25);

        // Penalize for serious complaints
        if ($metrics['serious_complaints'] > 0) {
            $score -= ($metrics['serious_complaints'] * 20);
        }

        return max(0, min($score, 100));
    }
}
