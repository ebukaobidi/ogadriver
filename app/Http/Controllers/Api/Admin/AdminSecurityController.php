<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\Blacklist;
use App\Models\Driver;

class AdminSecurityController extends Controller
{
    public function getAuditLogs()
    {
        $logs = Cache::rememberForever('admin_audit_logs', function () {
            return [];
        });

        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }

    public function getSecuritySettings()
    {
        $dbSettings = \App\Models\ApiSetting::getByCategory('security');
        $defaultSettings = [
            'require2FA' => true,
            'sessionTimeout' => 30, // minutes
            'maxLoginAttempts' => 5,
            'passwordExpiry' => 90, // days
            'ipWhitelist' => '',
            'auditLogRetention' => 365 // days
        ];
        
        $settings = array_merge($defaultSettings, $dbSettings->toArray());

        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    public function updateSecuritySettings(Request $request)
    {
        foreach ($request->except('_token') as $key => $value) {
            \App\Models\ApiSetting::setValue($key, (string)$value, 'security', false);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Security settings updated successfully'
        ]);
    }

    public function getBlacklist(Request $request)
    {
        $query = Driver::with('user')->where('status', 'blacklisted');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $paginated = $query->orderBy('updated_at', 'desc')->paginate(10);

        $paginated->through(function ($driver) {
            return [
                'id' => $driver->id,
                'name' => $driver->user ? $driver->user->name : 'Unknown',
                'email' => $driver->user ? $driver->user->email : 'N/A',
                'phone' => $driver->user ? $driver->user->phone : 'N/A',
                'dateBlacklisted' => $driver->updated_at->format('Y-m-d'),
                'reasonType' => 'Policy Violation',
                'reasonDetails' => 'Operative was suspended and blacklisted from the directory.',
                'adminName' => 'System Admin',
                'severity' => 'Critical'
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $paginated
        ]);
    }

    public function addToBlacklist(Request $request)
    {
        $validated = $request->validate([
            'driver_id' => 'required|exists:drivers,id',
            'reason' => 'required|string|max:500',
            'severity' => 'nullable|in:permanent,temporary',
            'notes' => 'nullable|string'
        ]);

        $driver = Driver::findOrFail($validated['driver_id']);
        $driver->status = 'blacklisted';
        $driver->save();

        Blacklist::blacklistEntity(
            'driver',
            (string)$driver->id,
            $validated['reason'],
            $validated['severity'] ?? 'permanent',
            $driver->user_id,
            auth()->id(),
            $validated['notes'] ?? null
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Driver blacklisted successfully'
        ]);
    }
}
