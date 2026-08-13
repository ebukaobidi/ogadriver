<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dispute;
use App\Models\TransportJob;
use App\Models\DriverLocation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DisputeController extends Controller
{
    /**
     * Display a listing of disputes
     */
    public function index(Request $request): JsonResponse
    {
        $query = Dispute::with(['job.hirer.user', 'raisedBy.user', 'againstUser.user', 'assignedTo.user']);

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('raised_by')) {
            $query->where('raised_by', $request->raised_by);
        }

        $disputes = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $disputes,
        ]);
    }

    /**
     * Store a newly created dispute
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'job_id' => 'required|exists:transport_jobs,id',
            'against_user_id' => 'required|exists:users,id',
            'type' => 'required|in:payment_issue,service_quality,driver_behavior,safety_concern,other',
            'description' => 'required|string|min:10',
            'evidence' => 'nullable|array',
        ]);

        $job = TransportJob::findOrFail($request->job_id);
        $user = $request->user();

        // Check if dispute already exists for this job
        $existingDispute = Dispute::where('job_id', $job->id)
            ->whereIn('status', ['open', 'under_review'])
            ->first();

        if ($existingDispute) {
            return response()->json([
                'success' => false,
                'message' => 'A dispute is already open for this job',
            ], 400);
        }

        $dispute = Dispute::create([
            'job_id' => $job->id,
            'raised_by' => $user->id,
            'against_user_id' => $request->against_user_id,
            'type' => $request->type,
            'description' => $request->description,
            'evidence' => $request->evidence,
            'status' => 'open',
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $dispute->load('job', 'raisedBy.user', 'againstUser.user'),
            'message' => 'Dispute created successfully',
        ], 201);
    }

    /**
     * Display the specified dispute with full tracking history
     */
    public function show(string $id): JsonResponse
    {
        $dispute = Dispute::with([
            'job.hirer.user',
            'job.driver.user',
            'raisedBy.user',
            'againstUser.user',
            'assignedTo.user',
            'job.locations'
        ])->findOrFail($id);

        // Get tracking history for the job
        $trackingHistory = DriverLocation::where('job_id', $dispute->job_id)
            ->orderBy('recorded_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'dispute' => $dispute,
                'tracking_history' => $trackingHistory,
                'job_details' => $dispute->job,
            ],
        ]);
    }

    /**
     * Update the specified dispute
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $dispute = Dispute::findOrFail($id);
        $user = $request->user();

        $request->validate([
            'status' => 'nullable|in:open,under_review,resolved,escalated,closed',
            'assigned_to' => 'nullable|exists:users,id',
            'resolution_notes' => 'nullable|string',
            'penalty_amount' => 'nullable|numeric|min:0',
            'penalty_applied_to' => 'nullable|in:driver,hirer',
        ]);

        // Only admins or assigned users can update
        if (!$user->isAdmin() && $dispute->assigned_to !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update this dispute',
            ], 403);
        }

        DB::transaction(function () use ($dispute, $request) {
            $dispute->update($request->only([
                'status',
                'assigned_to',
                'resolution_notes',
                'penalty_amount',
                'penalty_applied_to',
            ]));

            // Apply penalty if specified
            if ($request->has('penalty_amount') && $request->penalty_amount > 0) {
                $this->applyPenalty($dispute, $request->penalty_amount, $request->penalty_applied_to);
            }
        });

        return response()->json([
            'success' => true,
            'data' => $dispute->load('assignedTo.user'),
            'message' => 'Dispute updated successfully',
        ]);
    }

    /**
     * Assign dispute to admin
     */
    public function assign(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $dispute = Dispute::findOrFail($id);
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can assign disputes',
            ], 403);
        }

        $dispute->assignTo($request->assigned_to);

        return response()->json([
            'success' => true,
            'data' => $dispute->load('assignedTo.user'),
            'message' => 'Dispute assigned successfully',
        ]);
    }

    /**
     * Resolve dispute
     */
    public function resolve(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'resolution_notes' => 'required|string',
            'refund_amount' => 'nullable|numeric|min:0',
            'penalty_amount' => 'nullable|numeric|min:0',
            'penalty_applied_to' => 'nullable|in:driver,hirer',
        ]);

        $dispute = Dispute::findOrFail($id);
        $user = $request->user();

        if (!$user->isAdmin() && $dispute->assigned_to !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to resolve this dispute',
            ], 403);
        }

        DB::transaction(function () use ($dispute, $request) {
            $dispute->resolve($request->resolution_notes);

            // Apply refund if specified
            if ($request->has('refund_amount') && $request->refund_amount > 0) {
                $this->processRefund($dispute, $request->refund_amount);
            }

            // Apply penalty if specified
            if ($request->has('penalty_amount') && $request->penalty_amount > 0) {
                $this->applyPenalty($dispute, $request->penalty_amount, $request->penalty_applied_to);
            }
        });

        return response()->json([
            'success' => true,
            'data' => $dispute->load('job'),
            'message' => 'Dispute resolved successfully',
        ]);
    }

    /**
     * Escalate dispute
     */
    public function escalate(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'escalation_reason' => 'required|string',
        ]);

        $dispute = Dispute::findOrFail($id);
        $user = $request->user();

        if (!$user->isAdmin() && $dispute->assigned_to !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to escalate this dispute',
            ], 403);
        }

        $dispute->escalate($request->escalation_reason);

        return response()->json([
            'success' => true,
            'data' => $dispute,
            'message' => 'Dispute escalated successfully',
        ]);
    }

    /**
     * Close dispute
     */
    public function close(Request $request, string $id): JsonResponse
    {
        $dispute = Dispute::findOrFail($id);
        $user = $request->user();

        if (!$user->isAdmin() && $dispute->assigned_to !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to close this dispute',
            ], 403);
        }

        $dispute->update([
            'status' => 'closed',
            'resolved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dispute closed successfully',
        ]);
    }

    /**
     * Remove the specified dispute
     */
    public function destroy(string $id): JsonResponse
    {
        $dispute = Dispute::findOrFail($id);
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can delete disputes',
            ], 403);
        }

        // Only allow deletion of resolved/closed disputes
        if (!in_array($dispute->status, ['resolved', 'closed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete active disputes',
            ], 400);
        }

        $dispute->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dispute deleted successfully',
        ]);
    }

    /**
     * Get dispute statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => Dispute::count(),
            'open' => Dispute::where('status', 'open')->count(),
            'under_review' => Dispute::where('status', 'under_review')->count(),
            'resolved' => Dispute::where('status', 'resolved')->count(),
            'escalated' => Dispute::where('status', 'escalated')->count(),
            'by_type' => Dispute::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'avg_resolution_time' => $this->getAverageResolutionTime(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Apply penalty to user wallet
     */
    protected function applyPenalty(Dispute $dispute, float $amount, string $appliedTo): void
    {
        $user = $appliedTo === 'driver'
            ? $dispute->job->driver->user
            : $dispute->job->hirer->user;

        if ($user && $user->wallet) {
            $user->wallet->debit(
                $amount,
                'debit',
                'penalty',
                "Penalty for dispute #{$dispute->id}",
                "dispute_{$dispute->id}"
            );
        }
    }

    /**
     * Process refund for dispute
     */
    protected function processRefund(Dispute $dispute, float $amount): void
    {
        $hirerWallet = $dispute->job->hirer->user->wallet;
        $driverWallet = $dispute->job->driver->user->wallet;

        if ($hirerWallet && $driverWallet) {
            // Process refund directly from driver wallet to hirer wallet
            $driverWallet->debit($amount, 'debit', 'refund', "Refund for dispute #{$dispute->id}");
            $hirerWallet->credit($amount, 'credit', 'refund', "Refund for dispute #{$dispute->id}");
        }
    }

    /**
     * Get average dispute resolution time in hours
     */
    protected function getAverageResolutionTime(): float
    {
        $resolvedDisputes = Dispute::whereIn('status', ['resolved', 'closed'])
            ->whereNotNull('resolved_at')
            ->get();

        if ($resolvedDisputes->isEmpty()) {
            return 0;
        }

        $totalHours = $resolvedDisputes->sum(function ($dispute) {
            return $dispute->created_at->diffInHours($dispute->resolved_at);
        });

        return round($totalHours / $resolvedDisputes->count(), 2);
    }
}
