<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use Illuminate\Support\Facades\Validator;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $tickets = SupportTicket::with('replies')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json(['success' => true, 'tickets' => $tickets]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subject' => 'required|string',
            'category' => 'required|string',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $ticket = SupportTicket::create([
            'user_id' => $request->user()->id,
            'subject' => $request->subject,
            'category' => $request->category,
            'message' => $request->message,
            'priority' => 'normal',
            'status' => 'open'
        ]);

        return response()->json(['success' => true, 'ticket' => $ticket]);
    }

    public function reply(Request $request, $id)
    {
        $ticket = SupportTicket::where('user_id', $request->user()->id)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $reply = SupportTicketReply::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'is_admin' => false,
            'message' => $request->message
        ]);

        return response()->json(['success' => true, 'reply' => $reply]);
    }
}
