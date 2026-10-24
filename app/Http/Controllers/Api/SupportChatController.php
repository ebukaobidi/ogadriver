<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Ai\Agents\CustomerSupportAgent;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SupportChatController extends Controller
{
    public function streamChat(Request $request): StreamedResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'conversation_id' => 'nullable|string',
        ]);

        $user = $request->user();
        $userMessage = $request->input('message');
        $conversationId = $request->input('conversation_id');

        return response()->stream(function () use ($user, $userMessage, $conversationId) {
            set_time_limit(0);

            $agent = new CustomerSupportAgent();

            if ($conversationId) {
                $agent->continueConversation($conversationId);
            } else if ($user) {
                $agent->forUser($user);
            }

            $stream = $agent->stream($userMessage);

            foreach ($stream as $chunk) {
                if (connection_aborted()) {
                    break;
                }

                echo "data: " . json_encode(['content' => $chunk->text]) . "\n\n";

                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
            }

            echo "data: [DONE]\n\n";
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
