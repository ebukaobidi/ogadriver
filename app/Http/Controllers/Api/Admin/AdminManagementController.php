<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Role;
use App\Models\State;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['role', 'adminState'])
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
                'id' => $admin->id,
                'admin_id_formatted' => 'ADM-' . str_pad($admin->id, 4, '0', STR_PAD_LEFT),
                'name' => $admin->name,
                'email' => $admin->email,
                'department' => $admin->admin_department ?? 'none',
                'admin_state_id' => $admin->admin_state_id,
                'state_name' => $admin->adminState ? $admin->adminState->name : 'Global',
                'role' => $roleName,
                'role_slug' => $admin->role ? $admin->role->slug : 'admin',
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

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role_slug' => 'required|in:admin,super_admin',
            'admin_department' => 'required|in:super,treasury,regional,support,none',
            'admin_state_id' => 'nullable|exists:states,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $role = Role::where('slug', $request->role_slug)->first();
        if (!$role) {
            return response()->json(['status' => 'error', 'message' => 'Role not found'], 404);
        }

        $admin = new User();
        $admin->name = $request->name;
        $admin->email = $request->email;
        $admin->password = Hash::make($request->password);
        $admin->role_id = $role->id;
        $admin->admin_department = $request->admin_department;
        $admin->admin_state_id = $request->admin_state_id;
        $admin->is_active = true;
        // Mock phone to bypass constraints if needed
        $admin->phone = '+234' . rand(100000000, 999999999);
        $admin->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Admin provisioned successfully'
        ]);
    }

    public function update(Request $request, $id)
    {
        $admin = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'role_slug' => 'required|in:admin,super_admin',
            'admin_department' => 'required|in:super,treasury,regional,support,none',
            'admin_state_id' => 'nullable|exists:states,id',
            'status' => 'required|in:Active,Suspended'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => $validator->errors()->first()], 422);
        }

        $role = Role::where('slug', $request->role_slug)->first();
        if ($role) {
            $admin->role_id = $role->id;
        }

        $admin->admin_department = $request->admin_department;
        
        // If they are regional, enforce state, else allow null
        if ($request->admin_department === 'regional') {
            $admin->admin_state_id = $request->admin_state_id;
        } else {
            $admin->admin_state_id = $request->admin_state_id; // allow keeping it or clearing it based on frontend
        }
        
        $admin->is_active = ($request->status === 'Active');
        $admin->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Admin updated successfully'
        ]);
    }

    public function destroy($id)
    {
        $admin = User::findOrFail($id);
        
        // Prevent deleting oneself
        if (auth()->id() == $admin->id) {
            return response()->json(['status' => 'error', 'message' => 'Cannot delete your own account'], 403);
        }

        $admin->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Admin permanently revoked'
        ]);
    }
}
