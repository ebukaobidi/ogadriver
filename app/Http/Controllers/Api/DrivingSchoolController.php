<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\DrivingSchoolResource;
use App\Models\DrivingSchool;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DrivingSchoolController extends Controller
{
    /**
     * Display a paginated listing of driving schools.
     */
    public function index(Request $request)
    {
        $query = DrivingSchool::query()->active();

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
        $schools = $query->paginate($perPage);

        return DrivingSchoolResource::collection($schools);
    }

    /**
     * Display the specified driving school by slug.
     */
    public function show($slug)
    {
        $school = DrivingSchool::where('slug', $slug)->active()->firstOrFail();
        return new DrivingSchoolResource($school);
    }
}
?>
