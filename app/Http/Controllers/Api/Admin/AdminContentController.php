<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Models\SiteContent;

class AdminContentController extends Controller
{
    public function getBlogPosts()
    {
        $posts = \App\Models\BlogPost::orderBy('created_at', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $posts
        ]);
    }

    public function updateBlogPosts(Request $request)
    {
        $validated = $request->validate([
            'posts' => 'required|array',
            'posts.*.id' => 'nullable|integer',
            'posts.*.title' => 'required|string',
            'posts.*.slug' => 'required|string',
            'posts.*.author' => 'required|string',
            'posts.*.status' => 'required|string',
            'posts.*.category' => 'nullable|string',
            'posts.*.views' => 'nullable|integer',
            'posts.*.excerpt' => 'nullable|string',
            'posts.*.content' => 'nullable|string',
        ]);

        foreach ($validated['posts'] as $postData) {
            $id = $postData['id'] ?? null;
            unset($postData['id']);
            
            \App\Models\BlogPost::updateOrCreate(['id' => $id], $postData);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Blog posts updated successfully'
        ]);
    }

    public function getSiteContent()
    {
        $content = SiteContent::all();
        $keyed = [];
        foreach ($content as $item) {
            $keyed[$item->key_name] = $item->value;
        }

        return response()->json([
            'status' => 'success',
            'data' => (object)$keyed
        ]);
    }

    public function updateSiteContent(Request $request)
    {
        $data = $request->all();
        
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $value = json_encode($value);
            }
            
            SiteContent::updateOrCreate(
                ['key_name' => $key],
                [
                    'value' => $value,
                    'section_key' => 'general', // Default section
                    'type' => 'text'
                ]
            );
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Site content updated successfully'
        ]);
    }

    public function uploadContentImage(Request $request)
    {
        $request->validate([
            'section_key' => 'required|string',
            'key_name' => 'required|string',
            'image' => 'required|image|max:2048', // 2MB max
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('site_content', 'public');
            $fullPath = '/storage/' . $path;

            SiteContent::updateOrCreate(
                ['section_key' => $request->section_key, 'key_name' => $request->key_name],
                ['value' => $fullPath, 'type' => 'image']
            );

            return response()->json([
                'status' => 'success',
                'url' => asset($fullPath)
            ]);
        }

        return response()->json(['message' => 'No image uploaded'], 400);
    }
}
