<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExecutiveCarHire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminCarHireController extends Controller
{
    public function index()
    {
        return response()->json(ExecutiveCarHire::orderBy('created_at', 'desc')->paginate(20));
    }

    public function show($id)
    {
        return response()->json(ExecutiveCarHire::findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'state' => 'required|string|max:100',
            'lga' => 'required|string|max:100',
            'address' => 'nullable|string',
            'registration_number' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'fleet' => 'nullable|array',
            'services' => 'nullable|array',
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
                $path = $file->store('car_hires', 'public');
                $images[] = $path;
            }
        }
        $validated['images'] = $images;

        if ($request->hasFile('logo')) {
            $validated['logo_path'] = $request->file('logo')->store('car_hires/logos', 'public');
        }

        $carHire = ExecutiveCarHire::create($validated);
        return response()->json($carHire, 201);
    }

    public function update(Request $request, $id)
    {
        $carHire = ExecutiveCarHire::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'state' => 'sometimes|required|string|max:100',
            'lga' => 'sometimes|required|string|max:100',
            'address' => 'nullable|string',
            'slug' => 'sometimes|string|unique:executive_car_hires,slug,' . $id,
            'registration_number' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'is_active' => 'boolean',
            'is_verified' => 'boolean',
            'fleet' => 'nullable|array',
            'services' => 'nullable|array',
            'videos' => 'nullable|array|max:4',
            'videos.*' => 'nullable|url',
            'deleted_images' => 'nullable|array',
        ]);

        // Handle image management
        $images = $carHire->getRawOriginal('images') ?: [];
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
            if (count($images) + count($files) > 10) {
                return response()->json(['message' => 'Maximum 10 images allowed.'], 422);
            }
            foreach ($files as $file) {
                $path = $file->store('car_hires', 'public');
                $images[] = $path;
            }
        }
        $validated['images'] = array_values($images);

        if ($request->hasFile('logo')) {
            if ($carHire->getRawOriginal('logo_path')) {
                Storage::disk('public')->delete($carHire->getRawOriginal('logo_path'));
            }
            $validated['logo_path'] = $request->file('logo')->store('car_hires/logos', 'public');
        }

        $carHire->update($validated);
        // Standardize output to always include raw Original fields for editing
        $carHire->refresh();
        return response()->json($carHire);
    }

    public function destroy($id)
    {
        $carHire = ExecutiveCarHire::findOrFail($id);
        if ($carHire->getRawOriginal('images')) {
            $images = $carHire->getRawOriginal('images');
            if (is_string($images)) $images = json_decode($images, true) ?: [];
            foreach ($images as $oldImage) {
                $cleanPath = str_replace('/storage/', '', $oldImage);
                Storage::disk('public')->delete($cleanPath);
            }
        }
        if ($carHire->getRawOriginal('logo_path')) {
            Storage::disk('public')->delete($carHire->getRawOriginal('logo_path'));
        }
        $carHire->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
