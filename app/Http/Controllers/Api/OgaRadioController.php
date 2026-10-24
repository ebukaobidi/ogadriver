<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class OgaRadioController extends Controller
{
    /**
     * Official Walkie-Talkie Tactical Comms Channels (Push-To-Talk / Two-Way Net)
     */
    protected array $channels = [
        'lagos_mainland' => [
            'id' => 'lagos_mainland',
            'channel_code' => 'CH-01',
            'frequency' => 'CH-01',
            'name' => 'Lagos Mainland Grid',
            'coverage' => 'Ikeja, Yaba, Surulere, 3rd Mainland Bridge',
            'active_listeners' => 142,
            'active_drivers_on_net' => 142,
        ],
        'lagos_island' => [
            'id' => 'lagos_island',
            'channel_code' => 'CH-02',
            'frequency' => 'CH-02',
            'name' => 'Island & Lekki Express',
            'coverage' => 'VI, Ikoyi, Lekki Phase 1, Ajah, Epe',
            'active_listeners' => 198,
            'active_drivers_on_net' => 198,
        ],
        'abuja_fct' => [
            'id' => 'abuja_fct',
            'channel_code' => 'CH-03',
            'frequency' => 'CH-03',
            'name' => 'Abuja Federal Net',
            'coverage' => 'Central Area, Maitama, Wuse, Airport Road',
            'active_listeners' => 95,
            'active_drivers_on_net' => 95,
        ],
        'port_harcourt' => [
            'id' => 'port_harcourt',
            'channel_code' => 'CH-04',
            'frequency' => 'CH-04',
            'name' => 'Port Harcourt Hub',
            'coverage' => 'GRA, Trans-Amadi, Aba Road, Airport',
            'active_listeners' => 64,
            'active_drivers_on_net' => 64,
        ],
        'sos_emergency' => [
            'id' => 'sos_emergency',
            'channel_code' => 'CH-09',
            'frequency' => 'CH-09 (SOS)',
            'name' => '🚨 SOS Tactical Net',
            'coverage' => 'Nationwide Priority Road Hazard & Breakdown Net',
            'active_listeners' => 310,
            'active_drivers_on_net' => 310,
        ],
    ];

    /**
     * List all radio channels
     */
    public function getChannels(): JsonResponse
    {
        $channelList = [];
        foreach ($this->channels as $id => $info) {
            $floor = Cache::get('oga_radio_floor_' . $id);
            $channelList[] = array_merge($info, [
                'is_busy' => (bool)$floor,
                'speaker_name' => $floor['speaker']['name'] ?? null,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $channelList,
        ]);
    }

    /**
     * Get real-time status of a channel
     */
    public function getStatus(Request $request): JsonResponse
    {
        $channelId = $request->input('channel', 'lagos_mainland');
        if (!isset($this->channels[$channelId])) {
            $channelId = 'lagos_mainland';
        }

        $channelInfo = $this->channels[$channelId];
        $floorKey = 'oga_radio_floor_' . $channelId;
        $currentFloor = Cache::get($floorKey);

        $activeSpeaker = null;
        $floorStatus = 'idle';

        if ($currentFloor) {
            $floorStatus = 'transmitting';
            $startedAt = $currentFloor['speaker']['started_at'] ?? now()->timestamp;
            $elapsed = max(1, now()->timestamp - $startedAt);

            $activeSpeaker = array_merge($currentFloor['speaker'], [
                'seconds_elapsed' => $elapsed,
                'remaining_seconds' => max(0, 15 - $elapsed),
            ]);
        }

        // Recent traffic/hazard chatter log
        $logKey = 'oga_radio_log_' . $channelId;
        $recentChatter = Cache::get($logKey, [
            [
                'driver' => 'Emeka D.',
                'location' => '3rd Mainland Bridge (Adekunle)',
                'message' => 'Free flow moving towards Lagos Island, no hold-up.',
                'time_ago' => '2m ago'
            ],
            [
                'driver' => 'Babajide T.',
                'location' => 'Ikeja Along, Under Bridge',
                'message' => 'LASTMA active around computer village junction.',
                'time_ago' => '6m ago'
            ]
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'channel' => $channelInfo,
                'floor_status' => $floorStatus,
                'active_speaker' => $activeSpeaker,
                'recent_chatter' => $recentChatter,
                'max_duration_seconds' => 15,
            ]
        ]);
    }

    /**
     * Request microphone floor token (Half-Duplex Token Arbitration)
     * Strictly enforces ONE driver speaking at a time.
     */
    public function requestFloor(Request $request): JsonResponse
    {
        $user = $request->user();
        $channelId = $request->input('channel', 'lagos_mainland');
        if (!isset($this->channels[$channelId])) {
            $channelId = 'lagos_mainland';
        }

        $floorKey = 'oga_radio_floor_' . $channelId;
        $currentFloor = Cache::get($floorKey);

        // If another driver currently holds the airwaves
        if ($currentFloor && $currentFloor['user_id'] != $user->id) {
            $startedAt = $currentFloor['speaker']['started_at'] ?? now()->timestamp;
            $elapsed = now()->timestamp - $startedAt;

            if ($elapsed < 15) {
                return response()->json([
                    'success' => false,
                    'error_code' => 'CHANNEL_BUSY',
                    'message' => 'Frequency Occupied: Driver ' . $currentFloor['speaker']['name'] . ' is currently transmitting. Two drivers cannot speak at the same time to prevent voice collision. Please wait for the channel to clear.',
                    'active_speaker' => $currentFloor['speaker'],
                    'remaining_seconds' => 15 - $elapsed,
                ], 409);
            }
        }

        // Grant floor to this driver for 15 seconds max
        $speakerData = [
            'user_id' => $user->id,
            'driver_id' => $user->driver?->id,
            'name' => $user->name ? explode(' ', $user->name)[0] . ' (' . ($user->driver?->vehicle_make ?? 'Partner') . ')' : 'Driver ' . $user->id,
            'location' => $user->driver?->current_location ?? 'On Route (Active GPS)',
            'started_at' => now()->timestamp,
        ];

        Cache::put($floorKey, [
            'user_id' => $user->id,
            'speaker' => $speakerData,
        ], now()->addSeconds(15));

        return response()->json([
            'success' => true,
            'floor_status' => 'transmitting',
            'max_duration_seconds' => 15,
            'message' => 'Floor token granted. Mic is live on frequency ' . $this->channels[$channelId]['frequency'] . '.',
            'speaker' => $speakerData,
        ]);
    }

    /**
     * Release microphone floor token (Over & Out / Roger Beep)
     */
    public function releaseFloor(Request $request): JsonResponse
    {
        $user = $request->user();
        $channelId = $request->input('channel', 'lagos_mainland');
        $floorKey = 'oga_radio_floor_' . $channelId;

        $currentFloor = Cache::get($floorKey);
        if ($currentFloor && $currentFloor['user_id'] == $user->id) {
            Cache::forget($floorKey);

            // Append to recent chatter log
            $logKey = 'oga_radio_log_' . $channelId;
            $logs = Cache::get($logKey, []);
            array_unshift($logs, [
                'driver' => $currentFloor['speaker']['name'],
                'location' => $currentFloor['speaker']['location'],
                'message' => 'Voice burst transmitted on air (' . (now()->timestamp - $currentFloor['speaker']['started_at']) . 's)',
                'time_ago' => 'Just now',
            ]);
            Cache::put($logKey, array_slice($logs, 0, 10), now()->addHours(2));
        }

        return response()->json([
            'success' => true,
            'floor_status' => 'idle',
            'message' => 'Roger that. Channel floor is now idle and open.',
        ]);
    }
}
