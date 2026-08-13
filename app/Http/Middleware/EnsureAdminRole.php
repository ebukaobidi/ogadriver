<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized.'], 401);
        }

        // Determine user's role slug
        $userRole = null;
        if ($user->role) {
            $userRole = $user->role->slug;
        } else {
            // Fallback for role_id
            if ($user->role_id === 3) {
                $userRole = 'super_admin';
            } elseif ($user->role_id === 4) {
                $userRole = 'admin';
            } elseif ($user->role_id === 5) { // Assuming 5 might be security_admin
                $userRole = 'security_admin';
            }
        }

        if (empty($roles)) {
            $roles = ['super_admin']; // Default if none specified
        }

        if (!$userRole || !in_array($userRole, $roles)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Forbidden. You do not have the required role to perform this action.'
            ], 403);
        }

        return $next($request);
    }
}
