<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DrivingSchool;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminDrivingSchoolController extends Controller
{
    public function index()
    {
        return response()->json(DrivingSchool::orderBy('created_at', 'desc')->paginate(20));
    }

    public function show($id)
    {
        return response()->json(DrivingSchool::findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'state' => 'required|string|max:100',
            'lga' => 'required|string|max:100',
            'address' => 'nullable|string',
            'accreditation_number' => 'nullable|string',
            'accreditation_body' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'facilities' => 'nullable|array',
            'videos' => 'nullable|array|max:4',
            'videos.*' => 'nullable|url',
        ]);

        $validated['slug'] = $request->input('slug') ?: (Str::slug($validated['name']) . '-' . uniqid());

        // Handle image uploads
        $images = [];
        if ($request->hasFile('images')) {
            $files = $request->file('images');
            if (count($files) > 4) {
                return response()->json(['message' => 'Maximum 4 images allowed.'], 422);
            }
            foreach ($files as $file) {
                $path = $file->store('driving_schools', 'public');
                $images[] = $path;
            }
        }
        $validated['images'] = $images;

        if ($request->hasFile('logo')) {
            $validated['logo_path'] = $request->file('logo')->store('driving_schools/logos', 'public');
        }

        $school = DrivingSchool::create($validated);
        return response()->json($school, 201);
    }

    public function update(Request $request, $id)
    {
        $school = DrivingSchool::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'state' => 'sometimes|required|string|max:100',
            'lga' => 'sometimes|required|string|max:100',
            'address' => 'nullable|string',
            'slug' => 'sometimes|string|unique:driving_schools,slug,' . $id,
            'accreditation_number' => 'nullable|string',
            'accreditation_body' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'facilities' => 'nullable|array',
            'videos' => 'nullable|array|max:4',
            'videos.*' => 'nullable|url',
            'deleted_images' => 'nullable|array',
        ]);

        // Handle image management
        $images = $school->getRawOriginal('images') ?: [];
        if (is_string($images)) $images = json_decode($images, true) ?: [];

        if ($request->has('deleted_images')) {
            foreach ($request->deleted_images as $deletedPath) {
                $cleanPath = str_replace(['/storage/', asset('storage/')], '', $deletedPath);
                if (($key = array_search($cleanPath, $images)) !== false) {
                    unset($images[$key]);
                    Storage::disk('public')->delete($cleanPath);
                }
            }
        }

        if ($request->hasFile('images')) {
            $files = $request->file('images');
            if (count($images) + count($files) > 10) { // Increased limit for production flexibility
                return response()->json(['message' => 'Maximum 10 images allowed.'], 422);
            }
            foreach ($files as $file) {
                $path = $file->store('driving_schools', 'public');
                $images[] = $path;
            }
        }
        $validated['images'] = array_values($images);

        if ($request->hasFile('logo')) {
            if ($school->getRawOriginal('logo_path')) {
                Storage::disk('public')->delete($school->getRawOriginal('logo_path'));
            }
            $validated['logo_path'] = $request->file('logo')->store('driving_schools/logos', 'public');
        }

        $school->update($validated);
        // Standardize output to always include raw Original fields for editing
        $school->refresh();
        return response()->json($school);
    }

    public function destroy($id)
    {
        $school = DrivingSchool::findOrFail($id);
        if ($school->getRawOriginal('images')) {
            $images = $school->getRawOriginal('images');
            if (is_string($images)) $images = json_decode($images, true) ?: [];
            foreach ($images as $oldImage) {
                $cleanPath = str_replace('/storage/', '', $oldImage);
                Storage::disk('public')->delete($cleanPath);
            }
        }
        if ($school->getRawOriginal('logo_path')) {
            Storage::disk('public')->delete($school->getRawOriginal('logo_path'));
        }
        $school->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
