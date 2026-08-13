<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SiteContentController extends Controller
{
    public function index()
    {
        $contents = \App\Models\SiteContent::all();
        
        // Group by section_key for easier frontend consumption
        $grouped = [];
        foreach ($contents as $content) {
            if (!isset($grouped[$content->section_key])) {
                $grouped[$content->section_key] = [];
            }
            $grouped[$content->section_key][$content->key_name] = $content->value;
        }

        return response()->json($grouped);
    }

    public function update(Request $request)
    {
        $request->validate([
            'updates' => 'required|array',
            'updates.*.section_key' => 'required|string',
            'updates.*.key_name' => 'required|string',
            'updates.*.value' => 'required|string'
        ]);

        foreach ($request->updates as $update) {
            \App\Models\SiteContent::updateOrCreate(
                ['section_key' => $update['section_key'], 'key_name' => $update['key_name']],
                [
                    'value' => $update['value'],
                    'type' => $update['type'] ?? 'text'
                ]
            );
        }

        return response()->json(['message' => 'Content updated successfully']);
    }
}
