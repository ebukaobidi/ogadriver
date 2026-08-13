<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['role', 'driver']);

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('role') && $request->role !== 'all') {
            $roleSlug = $request->role;
            $query->whereHas('role', function($q) use ($roleSlug) {
                $q->where('slug', $roleSlug);
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $status = $request->status;
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'suspended' || $status === 'blacklisted' || $status === 'banned') {
                $query->where('is_active', false);
            }
        }

        // Use pagination
        $paginatedUsers = $query->orderBy('created_at', 'desc')->paginate(10);
        
        // Calculate global stats for top cards
        $stats = [
            'total' => User::count(),
            'active' => User::where('is_active', true)->count(),
            'pending' => 0,
            'banned' => User::where('is_active', false)->count(),
        ];

        $paginatedUsers->through(function ($user) {
            $roleSlug = $user->role ? $user->role->slug : 'user';
            
            $status = $user->is_active ? 'active' : 'suspended';

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? 'N/A',
                'role' => $roleSlug,
                'status' => $status,
                'joined' => $user->created_at ? $user->created_at->format('Y-m-d') : 'N/A',
                'lastLogin' => $user->last_login_at ? $user->last_login_at->diffForHumans() : 'Never',
                'completedContracts' => $user->driver ? $user->driver->total_jobs : 0,
                'rating' => $user->driver ? $user->driver->rating : 0,
                'avatar' => $user->avatar ? (str_starts_with($user->avatar, 'http') ? $user->avatar : asset('storage/' . $user->avatar)) : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $paginatedUsers,
            'stats' => $stats
        ]);
    }

    public function show($id)
    {
        $user = User::with(['role', 'driver.documents', 'driver.guarantors', 'hirer', 'wallet'])->findOrFail($id);

        $roleSlug = $user->role ? $user->role->slug : 'user';
        $status = $user->is_active ? 'active' : 'suspended';

        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? 'N/A',
            'role' => $roleSlug,
            'status' => $status,
            'gender' => $user->gender ?? 'N/A',
            'dateOfBirth' => $user->date_of_birth ?? 'N/A',
            'joinedDate' => $user->created_at ? $user->created_at->format('Y-m-d') : 'N/A',
            'lastLogin' => $user->last_login_at ? $user->last_login_at->diffForHumans() : 'Never',
            'avatar' => $user->avatar ? (str_starts_with($user->avatar, 'http') ? $user->avatar : asset('storage/' . $user->avatar)) : null,
            'wallet_balance' => $user->wallet ? number_format($user->wallet->balance, 2) : '0.00',
        ];

        if ($user->driver) {
            $userData['driver'] = [
                'id' => $user->driver->id,
                'status' => $user->driver->status,
                'is_verified' => $user->driver->is_verified,
                'clearanceLevel' => $user->driver->is_verified ? 'Verified' : 'Pending', // Add logic here if Elite/Premium logic exists
                'rating' => $user->driver->rating ?? 0,
                'total_jobs' => $user->driver->total_jobs ?? 0,
                'documents' => $user->driver->documents,
                'guarantors' => $user->driver->guarantors,
                'guarantorStatus' => 'pending' // You can calculate actual overall guarantor status if needed
            ];
        }

        if ($user->hirer) {
            $userData['hirer'] = [
                'id' => $user->hirer->id,
                'company' => $user->hirer->company_name,
                'type' => $user->hirer->employer_type,
                'accessTier' => $user->hirer->access_tier ?? 'Basic',
                'status' => $user->hirer->status ?? 'Active',
                'totalJobs' => $user->hirer->total_jobs_posted ?? 0,
                'activeContracts' => $user->hirer->active_contracts ?? 0,
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $userData
        ]);
    }

    public function suspend($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active; // Toggle suspension
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'User ' . ($user->is_active ? 'activated' : 'suspended') . ' successfully.'
        ]);
    }

    public function permaban($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = false;
        $user->save();
        
        // Mark as blacklisted in security table if it exists
        // $user->delete(); // Soft delete if necessary

        return response()->json([
            'status' => 'success',
            'message' => 'User permabanned successfully.'
        ]);
    }

    public function resetPassword($id)
    {
        $user = User::findOrFail($id);
        $user->password = \Illuminate\Support\Facades\Hash::make('Password123!');
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Password reset to default (Password123!).'
        ]);
    }
}
