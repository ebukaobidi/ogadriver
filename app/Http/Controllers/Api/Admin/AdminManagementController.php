<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class AdminManagementController extends Controller
{
    public function index(Request $request)
    {
        // Actually fetch admins via the role relationship
        $query = User::with('role')
            ->whereHas('role', function ($q) {
                $q->whereIn('slug', ['admin', 'superadmin', 'super_admin']);
            });

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $paginatedAdmins = $query->orderBy('created_at', 'desc')->paginate(10);
        
        // Dynamic stats
        $adminBase = User::whereHas('role', function ($q) {
            $q->whereIn('slug', ['admin', 'superadmin', 'super_admin']);
        });

        $stats = [
            'total_personnel' => (clone $adminBase)->count(),
            'super_admins' => (clone $adminBase)
                ->whereHas('role', function ($q) {
                    $q->whereIn('slug', ['superadmin', 'super_admin']);
                })->count(),
            'two_factor_enforced' => config('fortify.features') ? in_array('two-factor-authentication', config('fortify.features')) : false,
            'audit_logs' => count(Cache::get('admin_audit_logs', []))
        ];

        $paginatedAdmins->through(function ($admin) {
            $roleName = 'Admin';
            if ($admin->role && in_array($admin->role->slug, ['superadmin', 'super_admin'])) {
                $roleName = 'Super Admin';
            }

            return [
                'id' => 'ADM-' . str_pad($admin->id, 4, '0', STR_PAD_LEFT),
                'name' => $admin->name,
                'email' => $admin->email,
                'department' => $admin->role && $admin->role->slug === 'super_admin' ? 'Administration' : 'Operations',
                'role' => $roleName,
                'twoFactor' => false,
                'status' => $admin->is_active ? 'Active' : 'Suspended',
                'lastLogin' => $admin->updated_at ? $admin->updated_at->format('Y-m-d H:i') : 'Never'
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $paginatedAdmins,
            'stats' => $stats
        ]);
    }
}
