<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check if user has role_id 3 (Super Admin) or 4 (Admin)
        // Or if the role relationship has a slug of admin/super_admin
        $isAdmin = false;
        
        if ($user) {
            if (in_array($user->role_id, [3, 4])) {
                $isAdmin = true;
            } elseif ($user->role && in_array($user->role->slug, ['admin', 'super_admin'])) {
                $isAdmin = true;
            }
        }

        if (!$isAdmin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }

        return $next($request);
    }
}
