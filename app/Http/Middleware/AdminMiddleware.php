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

        // Prefer role slug (IDs are not stable across environments/seed order)
        $slug = strtolower((string) ($user?->role?->slug ?? ''));
        $isAdmin = in_array($slug, ['admin', 'super_admin', 'superadmin', 'administrator', 'state_manager', 'regional_admin'], true);

        if (! $isAdmin) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        return $next($request);
    }
}
