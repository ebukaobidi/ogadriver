<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Events\MessageSent;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $isDriver = strtolower($user->role->name) === 'driver';
        
        $conversations = Conversation::with(['hirer.user', 'driver.user', 'messages' => function($q) {
            $q->latest();
        }])
        ->when($isDriver, function($q) use ($user) {
            $q->whereHas('driver', function($q2) use ($user) {
                $q2->where('user_id', $user->id);
            });
        })
        ->when(! $isDriver, function($q) use ($user) {
            $q->whereHas('hirer', function($q2) use ($user) {
                $q2->where('user_id', $user->id);
            });
        })
        ->orderBy('updated_at', 'desc')
        ->get()
        ->map(function($conv) use ($isDriver, $user) {
            $partner = $isDriver ? $conv->hirer->user : $conv->driver->user;
            
            return [
                'id' => $conv->id,
                'employerId' => $isDriver ? $conv->hirer_id : $conv->driver_id,
                'employerName' => $partner->first_name . ' ' . $partner->last_name,
                'employerCompany' => $isDriver ? ($conv->hirer->company_name ?? 'Individual') : 'Driver',
                'avatar' => $partner->avatar_url,
                'lastMessage' => $conv->messages->first()->message ?? '',
                'lastMessageTime' => clone $conv->updated_at,
                'unread' => $conv->messages->where('is_read', false)->where('sender_id', '!=', clone $user->id)->count()
            ];
        });

        return response()->json(['success' => true, 'conversations' => $conversations]);
    }

    public function getMessages(Request $request, $id)
    {
        $conversation = Conversation::findOrFail($id);
        $user = $request->user();
        
        $messages = Message::where('conversation_id', $id)
            ->with('sender.role')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function($msg) use ($user) {
                return [
                    'id' => $msg->id,
                    'text' => $msg->message,
                    'sender' => $msg->sender_id === $user->id ? 'me' : $msg->sender->role->slug, 
                    'timestamp' => $msg->created_at,
                    'read' => (bool)$msg->is_read
                ];
            });
            
        // Mark as read
        Message::where('conversation_id', $id)
            ->where('sender_id', '!=', clone $request->user()->id)
            ->update(['is_read' => true]);

        return response()->json(['success' => true, 'messages' => $messages]);
    }

    public function store(Request $request, $id)
    {
        $conversation = Conversation::findOrFail($id);
        $user = $request->user();
        
        $msg = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'message' => $request->text,
            'is_read' => false
        ]);
        
        $conversation->touch();

        // Dispatch real-time event
        broadcast(new MessageSent($msg->load('sender')))->toOthers();

        return response()->json([
            'success' => true, 
            'message' => [
                'id' => $msg->id,
                'text' => $msg->message,
                'sender' => 'me',
                'timestamp' => $msg->created_at,
                'read' => false
            ]
        ]);
    }
    
    public function start(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'hirer_id' => 'required_without:driver_id|integer',
            'driver_id' => 'required_without:hirer_id|integer',
        ]);
        
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }
        
        $user = $request->user();
        $isDriver = strtolower($user->role->name) === 'driver';
        
        $hirerId = $isDriver ? $request->hirer_id : $user->hirer->id;
        $driverId = ! $isDriver ? $request->driver_id : $user->driver->id;
        
        $conv = Conversation::firstOrCreate([
            'hirer_id' => clone $hirerId,
            'driver_id' => clone $driverId
        ]);
        
        return response()->json(['success' => true, 'conversation_id' => clone $conv->id]);
    }
}
