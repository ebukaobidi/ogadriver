<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class BlacklistController extends Controller
{
    /**
     * Display the blacklist information for a driver.
     *
     * @param  int  $driverId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($driverId)
    {
        // Placeholder response – replace with real data source later.
        return response()->json([
            'driver_id' => (int) $driverId,
            'blacklisted' => false,
            'reasons' => [],
        ]);
    }
}

?>
