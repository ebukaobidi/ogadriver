<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;

class AdminSubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $role = $request->query('role', 'employer'); // employer | operative | all

        $query = Subscription::with(['user.driver', 'user.hirer', 'user.role'])
            ->orderBy('created_at', 'desc');

        if ($role === 'employer') {
            $query->where(function ($q) {
                $q->whereIn('type', [
                    'basic_recruiter',
                    'enterprise_elite',
                    'corporate',
                    'enterprise',
                    'Standard Gate',
                    'Elite Perimeter',
                    'Sovereign Fleet',
                ])->orWhereHas('user.hirer');
            });
        } elseif ($role === 'operative') {
            $query->where(function ($q) {
                $q->whereIn('type', [
                    'oga_basic',
                    'oga_premium',
                    'driver_pro',
                    'Trial Operative',
                    'Standard Operative',
                    'Elite Operative',
                    'Fleet Operative',
                ])->orWhereHas('user.driver');
            });
        }

        $subs = $query->get();

        $activeTiers = $subs->map(function ($sub) {
            $details = $sub->getTierDetails();
            $isEmployer = $sub->isEmployerSubscription() || (bool) $sub->user?->hirer;
            $driverLimit = ($isEmployer && in_array($sub->type, ['enterprise_elite', 'Elite Perimeter', 'Sovereign Fleet', 'enterprise'], true))
                ? 'Unlimited'
                : ($isEmployer ? 5 : 'N/A');

            $status = 'Expired';
            if ($sub->isActive()) {
                $status = 'Active';
            }
            
            $driversHired = 0;
            if ($isEmployer && $sub->user && $sub->user->hirer) {
                $driversHired = \App\Models\TransportJob::where('hirer_id', $sub->user->hirer->id)
                    ->whereIn('status', ['assigned', 'in_progress', 'completed'])
                    ->distinct('driver_id')
                    ->count();
            }

            return [
                'id' => 'ACC-' . str_pad($sub->id, 4, '0', STR_PAD_LEFT),
                'employer' => $sub->user ? $sub->user->name : 'Unknown',
                'member' => $sub->user ? $sub->user->name : 'Unknown',
                'role' => $isEmployer ? 'employer' : 'operative',
                'tierName' => $details['name'],
                'driverLimit' => $driverLimit,
                'driversHired' => $driversHired,
                'status' => $status,
                'validUntil' => $sub->ends_at ? $sub->ends_at->format('Y-m-d') : 'N/A',
                'autoRenew' => (bool) $sub->auto_renew,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'activeTiers' => $activeTiers,
            ]
        ]);
    }
}
