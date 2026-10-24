<?php

namespace App\Http\Controllers;

use App\Models\Infraction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InfractionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'driver_id' => 'required|exists:drivers,id',
            'type' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $user = Auth::user();
        if (!$user || !$user->hirer) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $infraction = Infraction::create([
            'driver_id' => $request->driver_id,
            'hirer_id' => $user->hirer->id,
            'type' => $request->type,
            'description' => $request->description,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Infraction logged successfully.',
            'infraction' => $infraction
        ], 201);
    }
}
