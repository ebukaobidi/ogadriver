<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class ServerMaintenanceController extends Controller
{
    /**
     * Get server diagnostics (memory, PHP version, uptime, cache status)
     */
    public function getDiagnostics()
    {
        $memoryUsage = round(memory_get_usage(true) / 1024 / 1024, 2) . ' MB';
        $peakMemory = round(memory_get_peak_usage(true) / 1024 / 1024, 2) . ' MB';
        $phpVersion = PHP_VERSION;
        $os = PHP_OS_FAMILY;

        return response()->json([
            'status' => 'success',
            'data' => [
                'php_version' => $phpVersion,
                'os' => $os,
                'memory_usage' => $memoryUsage,
                'peak_memory' => $peakMemory,
                'cache_driver' => config('cache.default'),
                'server_time' => now()->toDateTimeString(),
                'laravel_version' => app()->version(),
            ],
        ]);
    }

    /**
     * 1-Click Server Cache Clearing
     */
    public function clearCache()
    {
        try {
            Artisan::call('optimize:clear');
            Cache::flush();

            return response()->json([
                'status' => 'success',
                'message' => 'Server caches, route maps, and compiled views successfully cleared (optimize:clear executed)!',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cache clearing exception: ' . $e->getMessage(),
            ], 500);
        }
    }
}
