<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  mixed  ...$roles  Allowed roles (strings)
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // role() is a BelongsTo relation; compare against slug (and common aliases)
        $roleSlug = $user->role?->slug;
        if (! $roleSlug) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $normalizedRoles = array_map(static function ($role) {
            $role = strtolower(trim((string) $role));
            return match ($role) {
                'superadmin' => 'super_admin',
                'employer' => 'hirer',
                default => $role,
            };
        }, $roles);

        $userRole = match (strtolower($roleSlug)) {
            'superadmin' => 'super_admin',
            'employer' => 'hirer',
            default => strtolower($roleSlug),
        };

        if (! in_array($userRole, $normalizedRoles, true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}
