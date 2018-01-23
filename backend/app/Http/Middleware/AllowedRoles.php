<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class AllowedRoles
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Closure $next
     * @param array $roles
     * @return mixed
     */
    public function handle($request, Closure $next, ...$roles)
    {
        /**
         * @var \App\Models\User $user
         */
        $user = Auth::user();
        if (!$user) {
            return response()->json('', 401);
        }

        if (!$user->role || !in_array($user->role->roleName, $roles)) {
            return response()->json('', 403);
        }

        return $next($request);
    }
}
