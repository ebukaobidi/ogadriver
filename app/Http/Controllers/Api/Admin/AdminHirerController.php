<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Hirer;

class AdminHirerController extends Controller
{
    public function index(Request $request)
    {
        $query = Hirer::with('user')
            ->withCount([
                'jobs',
                'jobs as active_jobs_count' => function ($query) {
                    $query->where('status', 'in_progress');
                }
            ]);

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            })->orWhere('company_name', 'like', "%{$search}%");
        }

        $paginatedHirers = $query->orderBy('created_at', 'desc')->paginate(10);
        
        $stats = [
            'total_employers' => Hirer::count(),
            'active_access_tiers' => Hirer::whereHas('jobs', function ($q) {
                $q->where('status', 'in_progress');
            })->count(),
            'active_contracts' => \App\Models\TransportJob::where('status', 'in_progress')->count()
        ];

        $paginatedHirers->through(function ($hirer) {
            // Determine tier based on something or just default to Premium if they have many jobs
            $accessTier = 'Standard';
            if ($hirer->jobs_count > 10) $accessTier = 'Enterprise';
            elseif ($hirer->jobs_count > 3) $accessTier = 'Premium';

            return [
                'id' => 'EMP-' . str_pad($hirer->id, 4, '0', STR_PAD_LEFT),
                'name' => $hirer->user ? $hirer->user->name : 'Unknown',
                'company' => $hirer->company_name ?? 'Individual',
                'type' => $hirer->company_name ? 'Corporate' : 'Individual',
                'email' => $hirer->user ? $hirer->user->email : 'N/A',
                'phone' => $hirer->user ? $hirer->user->phone : 'N/A',
                'status' => $hirer->user && $hirer->user->is_active ? 'Active' : 'Suspended',
                'accessTier' => $accessTier,
                'joinedDate' => $hirer->created_at ? $hirer->created_at->format('Y-m-d') : 'N/A',
                'totalJobs' => $hirer->jobs_count, // No longer an N+1 query!
                'activeContracts' => $hirer->active_jobs_count, // No longer an N+1 query!
                'avatar' => $hirer->user && $hirer->user->avatar ? (str_starts_with($hirer->user->avatar, 'http') ? $hirer->user->avatar : asset('storage/' . $hirer->user->avatar)) : null
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $paginatedHirers,
            'stats' => $stats
        ]);
    }

    public function show($id)
    {
        $hirer = Hirer::with(['user', 'jobs'])->findOrFail($id);

        $accessTier = 'Standard';
        if ($hirer->company_name) {
            $accessTier = 'Enterprise';
        } elseif ($hirer->jobs()->count() > 5) {
            $accessTier = 'Premium';
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $hirer->id,
                'name' => $hirer->company_name ?: ($hirer->user ? $hirer->user->name : 'Unknown'),
                'company' => $hirer->company_name ?? 'Individual',
                'type' => $hirer->company_name ? 'Corporate' : 'Individual',
                'email' => $hirer->user ? $hirer->user->email : 'N/A',
                'phone' => $hirer->user ? $hirer->user->phone : 'N/A',
                'status' => $hirer->user && $hirer->user->is_active ? 'Active' : 'Suspended',
                'accessTier' => $accessTier,
                'joinedDate' => $hirer->created_at ? $hirer->created_at->format('Y-m-d') : 'N/A',
                'totalJobs' => $hirer->jobs()->count(),
                'activeContracts' => $hirer->jobs()->whereIn('status', ['assigned', 'in_progress'])->count(),
                'avatar' => $hirer->user && $hirer->user->avatar ? asset('storage/' . $hirer->user->avatar) : null,
                'address' => $hirer->address ?? 'N/A',
            ]
        ]);
    }

    public function suspend($id)
    {
        $hirer = Hirer::findOrFail($id);
        if ($hirer->user) {
            $hirer->user->is_active = !$hirer->user->is_active;
            $hirer->user->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Employer ' . ($hirer->user && $hirer->user->is_active ? 'activated' : 'suspended') . ' successfully.'
        ]);
    }

    public function approveKyc($id)
    {
        $hirer = Hirer::findOrFail($id);
        $hirer->verification_status = 'verified';
        $hirer->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Employer KYC approved successfully.'
        ]);
    }

    public function rejectKyc(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string'
        ]);

        $hirer = Hirer::findOrFail($id);
        $hirer->verification_status = 'rejected';
        // You might want to store the reason somewhere
        $hirer->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Employer KYC rejected successfully.'
        ]);
    }
}
