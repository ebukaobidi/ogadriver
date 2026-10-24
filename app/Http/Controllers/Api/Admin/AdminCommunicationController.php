<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Broadcast;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use Illuminate\Support\Facades\Validator;

class AdminCommunicationController extends Controller
{
    public function getBroadcasts(Request $request)
    {
        $query = Broadcast::query()->orderBy('created_at', 'desc');
        if ($request->has('search') && $request->search) {
            $query->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('message', 'like', '%' . $request->search . '%');
        }
        return response()->json([
            'success' => true,
            'broadcasts' => $query->get()
        ]);
    }

    public function storeBroadcast(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'message' => 'required|string',
            'target_audience' => 'required|string',
            'priority' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $broadcast = Broadcast::create([
            'title' => $request->title,
            'message' => $request->message,
            'target_audience' => $request->target_audience,
            'priority' => $request->priority,
            'status' => 'sent',
            'recipient_count' => \App\Models\User::count(), // Approximation for now
            'scheduled_for' => $request->scheduled_for
        ]);

        return response()->json(['success' => true, 'broadcast' => $broadcast]);
    }

    public function getTickets(Request $request)
    {
        $query = SupportTicket::with(['replies', 'user'])->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->has('search') && $request->search) {
            $query->where('subject', 'like', '%' . $request->search . '%');
        }

        $tickets = $query->get()->map(function($ticket) {
            // Frontend expects user_name
            $ticket->user_name = $ticket->user ? $ticket->user->name : 'Unknown';
            
            // Format replies
            if ($ticket->replies) {
                foreach($ticket->replies as $reply) {
                    if ($reply->is_admin) {
                        $reply->sender_name = 'OgaDriver Admin';
                    } else {
                        $reply->sender_name = $ticket->user_name;
                    }
                }
            }
            return $ticket;
        });

        return response()->json(['success' => true, 'tickets' => $tickets]);
    }

    public function updateTicketStatus(Request $request, $id)
    {
        $ticket = SupportTicket::findOrFail($id);
        $ticket->update(['status' => $request->status]);
        return response()->json(['success' => true]);
    }

    public function replyToTicket(Request $request, $id)
    {
        $ticket = SupportTicket::findOrFail($id);
        
        $reply = SupportTicketReply::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'is_admin' => true,
            'message' => $request->message
        ]);
        
        $reply->sender_name = 'OgaDriver Admin';
        
        $ticket->update(['status' => 'in_progress']);

        return response()->json(['success' => true, 'reply' => $reply]);
    }
}
