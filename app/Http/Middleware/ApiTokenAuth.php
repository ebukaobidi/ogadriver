<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;

class ApiTokenAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        
        // Also check for token in request body for compatibility
        if (!$token && $request->has('token')) {
            $token = $request->input('token');
        }
        
        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication token required',
            ], 401);
        }
        
        // Find user by API token
        $user = User::where('api_token', $token)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid authentication token',
            ], 401);
        }
        
        // Check if user is active
        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Account has been deactivated',
            ], 403);
        }
        
        // Authenticate the user
        auth()->login($user);
        
        return $next($request);
    }
}
