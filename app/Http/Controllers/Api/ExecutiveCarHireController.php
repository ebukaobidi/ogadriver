<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ExecutiveCarHireResource;
use App\Models\ExecutiveCarHire;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ExecutiveCarHireController extends Controller
{
    /**
     * Display a paginated listing of executive car hire services.
     */
    public function index(Request $request)
    {
        $query = ExecutiveCarHire::query()->active();

        if ($request->filled('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->filled('state')) {
            $query->where('state', $request->input('state'));
        }

        if ($request->filled('lga')) {
            $query->where('lga', $request->input('lga'));
        }

        $sort = $request->query('sort', 'name');
        $order = $request->query('order', 'asc');
        $query->orderBy($sort, $order);

        $perPage = $request->query('per_page', 10);
        $hires = $query->paginate($perPage);

        return ExecutiveCarHireResource::collection($hires);
    }

    /**
     * Display the specified executive car hire service by slug.
     */
    public function show($slug)
    {
        $hire = ExecutiveCarHire::where('slug', $slug)->active()->firstOrFail();
        return new ExecutiveCarHireResource($hire);
    }
}
