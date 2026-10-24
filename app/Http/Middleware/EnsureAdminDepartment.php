<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminDepartment
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$departments
     */
    public function handle(Request $request, Closure $next, ...$departments): Response
    {
        $user = $request->user();

        if (!$user || !$user->isAnyAdmin()) {
            return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
        }

        // Super admins override all department checks
        if ($user->admin_department === 'super') {
            return $next($request);
        }

        // Check if the user's department matches any of the required ones
        if (in_array($user->admin_department, $departments)) {
            return $next($request);
        }

        return response()->json(['message' => 'Forbidden. Your admin department does not have clearance for this action.'], 403);
    }
}
