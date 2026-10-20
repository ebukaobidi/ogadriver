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
        $drivers = Driver::with('user')->orderBy('created_at', 'desc')->limit(20)->get()->map(function($d) {
            return [
                'id' => 'LOG-DR-' . $d->id,
                'timestamp' => $d->created_at->format('Y-m-d H:i:s'),
                'action' => 'driver_registration',
                'user' => $d->user->name ?? 'System',
                'details' => 'New driver registration: ' . ($d->user->email ?? 'N/A'),
                'ip' => '127.0.0.1',
                'status' => 'success'
            ];
        });

        $blacklists = Blacklist::with('bannedBy')->orderBy('created_at', 'desc')->limit(20)->get()->map(function($b) {
            return [
                'id' => 'LOG-BL-' . $b->id,
                'timestamp' => $b->created_at->format('Y-m-d H:i:s'),
                'action' => 'driver_blacklist',
                'user' => $b->bannedBy->name ?? 'Admin',
                'details' => 'Entity blacklisted: ' . $b->entity_identifier . ' Reason: ' . $b->reason,
                'ip' => '127.0.0.1',
                'status' => 'success'
            ];
        });

        $transactions = \App\Models\Transaction::with('wallet.user')->orderBy('created_at', 'desc')->limit(20)->get()->map(function($t) {
            return [
                'id' => 'LOG-TX-' . $t->id,
                'timestamp' => $t->created_at->format('Y-m-d H:i:s'),
                'action' => 'payment_received',
                'user' => $t->wallet->user->name ?? 'System',
                'details' => 'Transaction ' . $t->reference . ' of NGN ' . number_format($t->amount),
                'ip' => '127.0.0.1',
                'status' => 'success'
            ];
        });

        $logs = $drivers->concat($blacklists)->concat($transactions)->sortByDesc('timestamp')->values()->all();

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
        $query = Blacklist::with(['user', 'bannedBy']);

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('entity_identifier', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%")
                  ->orWhereHas('user', function($qu) use ($search) {
                      $qu->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('entity_type', $request->type);
        }

        $paginated = $query->orderBy('created_at', 'desc')->paginate(10);

        $paginated->through(function ($item) {
            return [
                'id' => $item->id,
                'type' => $item->entity_type,
                'value' => $item->entity_identifier,
                'reason' => $item->reason,
                'addedBy' => $item->bannedBy ? $item->bannedBy->name : 'System',
                'addedDate' => $item->created_at->format('Y-m-d'),
                'status' => $item->isActive() ? 'Active' : 'Expired',
                'severity' => ucfirst($item->severity),
                'notes' => $item->notes
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $paginated
        ]);
    }

    public function removeFromBlacklist($id)
    {
        $item = Blacklist::findOrFail($id);
        
        // If it's a driver, we might want to restore their status
        if ($item->entity_type === 'driver') {
            $driver = Driver::find((int)$item->entity_identifier);
            if ($driver && $driver->status === 'blacklisted') {
                $driver->status = 'active'; // Or whatever default status
                $driver->save();
            }
        }

        $item->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Item removed from blacklist'
        ]);
    }

    public function addToBlacklist(Request $request)
    {
        $validated = $request->validate([
            'type' => 'nullable|string|in:driver,hirer,email,phone,ip,domain',
            'driver_id' => 'nullable|exists:drivers,id',
            'value' => 'nullable|string',
            'reason' => 'required|string|max:500',
            'severity' => 'nullable|in:permanent,temporary,warning',
            'notes' => 'nullable|string'
        ]);

        $entityType = $validated['type'] ?? 'driver';
        $entityIdentifier = $validated['value'] ?? '';
        $userId = null;

        if ($entityType === 'driver' && isset($validated['driver_id'])) {
            $driver = Driver::findOrFail($validated['driver_id']);
            $driver->status = 'blacklisted';
            $driver->save();
            $entityIdentifier = (string)$driver->id;
            $userId = $driver->user_id;
        }

        Blacklist::blacklistEntity(
            $entityType,
            $entityIdentifier,
            $validated['reason'],
            $validated['severity'] ?? 'permanent',
            $userId,
            auth()->id(),
            $validated['notes'] ?? null
        );

        return response()->json([
            'status' => 'success',
            'message' => ucfirst($entityType) . ' blacklisted successfully'
        ]);
    }
}
