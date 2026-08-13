<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CacheService;

class LocationController
{
    protected CacheService $cacheService;

    public function __construct(CacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    public function countries()
    {
        try {
            // Check database connection
            \DB::connection()->getPdo();
            \Log::info('Database connection successful');

            // Check if countries table exists
            if (!\Schema::hasTable('countries')) {
                \Log::error('Countries table does not exist');
                return response()->json(['error' => 'Countries table does not exist'], 500);
            }

            $countries = \App\Models\Country::orderBy('name')->get();
            \Log::info('Countries query executed', ['count' => $countries->count(), 'data' => $countries->toArray()]);
            return response()->json($countries);
        } catch (\Exception $e) {
            \Log::error('Countries query failed', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function states($country_id)
    {
        return response()->json(
            $this->cacheService->getStates($country_id)
        );
    }

    public function cities($state_id)
    {
        return response()->json(
            $this->cacheService->getCitiesByState($state_id)
        );
    }
}
