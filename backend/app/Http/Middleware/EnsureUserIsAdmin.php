<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (!$user->is_active) {
            $user->tokens()->delete();
            return response()->json([
                'message' => 'Akun Anda dinonaktifkan oleh administrator.',
            ], 403);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Akses ditolak. Fitur ini hanya dapat diakses oleh Administrator.',
            ], 403);
        }

        return $next($request);
    }
}
