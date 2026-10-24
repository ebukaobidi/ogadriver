<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ApiSetting;

class CheckMaintenanceMode
{
    public function handle(Request $request, Closure $next)
    {
        // Don't block admin routes or login
        if ($request->is('api/admin/*') || $request->is('api/auth/*') || $request->is('api/settings/public')) {
            return $next($request);
        }

        try {
            $maintenance = ApiSetting::getValue('maintenance_mode');
            if ($maintenance === 'true') {
                return response()->json([
                    'success' => false,
                    'message' => 'Platform is currently undergoing scheduled maintenance. Please check back shortly.'
                ], 503);
            }
        } catch (\Exception $e) {
            // Ignore DB errors
        }

        return $next($request);
    }
}
