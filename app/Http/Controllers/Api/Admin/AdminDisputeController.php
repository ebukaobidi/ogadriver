<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dispute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDisputeController extends Controller
{
    public function index(Request $request)
    {
        $query = Dispute::with(['job.hirer.user', 'job.driver.user', 'raisedBy']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhereHas('job.hirer.user', function($qu) use ($search) {
                      $qu->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('job.driver.user', function($qu) use ($search) {
                      $qu->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $paginated = $query->orderBy('created_at', 'desc')->paginate(10);

        $paginated->through(function ($dispute) {
            return [
                'id' => $dispute->id,
                'reference_number' => 'DSP-' . str_pad($dispute->id, 5, '0', STR_PAD_LEFT),
                'title' => ucfirst(str_replace('_', ' ', $dispute->type)) . ' Dispute',
                'description' => $dispute->description,
                'status' => $dispute->status,
                'created_at' => $dispute->created_at->toISOString(),
                'driver_name' => $dispute->job && $dispute->job->driver && $dispute->job->driver->user ? $dispute->job->driver->user->name : 'Unknown',
                'driver_phone' => $dispute->job && $dispute->job->driver && $dispute->job->driver->user ? $dispute->job->driver->user->phone : 'N/A',
                'employer_name' => $dispute->job && $dispute->job->hirer && $dispute->job->hirer->user ? $dispute->job->hirer->user->name : 'Unknown',
                'employer_phone' => $dispute->job && $dispute->job->hirer && $dispute->job->hirer->user ? $dispute->job->hirer->user->phone : 'N/A',
                'employer_company' => $dispute->job && $dispute->job->hirer ? $dispute->job->hirer->company_name : 'Individual',
                'evidence_count' => is_array($dispute->evidence) ? count($dispute->evidence) : 0,
                'evidence' => is_array($dispute->evidence) ? $dispute->evidence : [],
                'severity' => $dispute->status === 'escalated' ? 'Critical' : 'Medium'
            ];
        });

        return response()->json([
            'success' => true,
            'disputes' => $paginated
        ]);
    }

    public function resolve(Request $request, $id)
    {
        $request->validate([
            'resolution' => 'required|in:approved,rejected',
            'notes' => 'required|string'
        ]);

        $dispute = Dispute::findOrFail($id);
        
        $newStatus = $request->resolution === 'approved' ? 'resolved_driver' : 'resolved_employer';
        
        $dispute->status = $newStatus;
        $dispute->resolution_notes = $request->notes;
        $dispute->resolved_at = now();
        $dispute->save();

        return response()->json([
            'success' => true,
            'message' => 'Dispute resolved successfully'
        ]);
    }

    public function escalate($id)
    {
        $dispute = Dispute::findOrFail($id);
        $dispute->status = 'escalated';
        $dispute->save();

        return response()->json([
            'success' => true,
            'message' => 'Dispute escalated successfully'
        ]);
    }
}
