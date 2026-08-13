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
        $posts = Cache::rememberForever('admin_blog_posts', function () {
            return [];
        });

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
            'posts.*.views' => 'nullable|integer',
            'posts.*.date' => 'nullable|date'
        ]);

        Cache::forever('admin_blog_posts', $validated['posts']);

        return response()->json([
            'status' => 'success',
            'message' => 'Blog posts updated successfully'
        ]);
    }

    public function getSiteContent()
    {
        $content = SiteContent::all();
        $grouped = [];
        foreach ($content as $item) {
            if (!isset($grouped[$item->section_key])) {
                $grouped[$item->section_key] = [];
            }
            $grouped[$item->section_key][$item->key_name] = $item->value;
        }

        return response()->json([
            'status' => 'success',
            'data' => $content
        ]);
    }

    public function updateSiteContent(Request $request)
    {
        $request->validate([
            'updates' => 'required|array',
            'updates.*.section_key' => 'required|string',
            'updates.*.key_name' => 'required|string',
            'updates.*.value' => 'required|string'
        ]);

        foreach ($request->updates as $update) {
            SiteContent::updateOrCreate(
                ['section_key' => $update['section_key'], 'key_name' => $update['key_name']],
                [
                    'value' => $update['value'],
                    'type' => $update['type'] ?? 'text'
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
