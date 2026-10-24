<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\OgaCopilotService;

class OgaCopilotController extends Controller
{
    protected $copilotService;

    public function __construct(OgaCopilotService $copilotService)
    {
        $this->copilotService = $copilotService;
    }

    public function getDemandRadar(Request $request)
    {
        $lat = $request->query('lat');
        $lng = $request->query('lng');

        $radar = $this->copilotService->getDemandRadar($lat, $lng);

        return response()->json([
            'success' => true,
            'data' => $radar,
        ]);
    }
}
