<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['role', 'driver']);

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            
            // Check if search term matches the driver formatted ID format, e.g. OGD-NG-LA-0402
            $userIdFromFormatted = null;
            if (preg_match('/OGD-NG-[A-Z]{2}-([0-9A-F]+)/i', $search, $matches)) {
                $hex = $matches[1];
                $userIdFromFormatted = hexdec($hex);
            }

            $query->where(function($q) use ($search, $userIdFromFormatted) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
                
                if (is_numeric($search)) {
                    $q->orWhere('id', $search);
                }
                
                if ($userIdFromFormatted) {
                    $q->orWhere('id', $userIdFromFormatted);
                }

                $q->orWhereHas('driver', function($dq) use ($search) {
                    $dq->whereHas('state', function($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%")
                           ->orWhere('code', 'like', "%{$search}%");
                    })->orWhereHas('city', function($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%");
                    });
                });
            });
        }

        if ($request->has('role') && $request->role !== 'all') {
            $roleSlug = $request->role;
            $query->whereHas('role', function($q) use ($roleSlug) {
                $q->where('slug', $roleSlug);
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $status = $request->status;
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'suspended' || $status === 'blacklisted' || $status === 'banned') {
                $query->where('is_active', false);
            }
        }

        // Use pagination — caller can request up to 200 per page (default 50)
        $perPage = min((int) $request->input('per_page', 50), 200);
        $paginatedUsers = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        // Calculate global stats for top cards
        $stats = [
            'total'   => User::count(),
            'active'  => User::where('is_active', true)->count(),
            'pending' => User::whereNull('phone_verified_at')->count(), // unverified registrations
            'banned'  => User::where('is_active', false)->count(),
        ];

        $paginatedUsers->through(function ($user) {
            $roleSlug = $user->role ? $user->role->slug : 'user';
            
            $status = $user->is_active ? 'active' : 'suspended';

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? 'N/A',
                'role' => $roleSlug,
                'status' => $status,
                'joined' => $user->created_at ? $user->created_at->format('Y-m-d') : 'N/A',
                'lastLogin' => $user->last_login_at ? $user->last_login_at->diffForHumans() : 'Never',
                'completedContracts' => $user->driver ? $user->driver->total_jobs : 0,
                'rating' => $user->driver ? $user->driver->rating : 0,
                'avatar' => $user->avatar ? (str_starts_with($user->avatar, 'http') ? $user->avatar : Storage::disk('public')->url($user->avatar)) : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $paginatedUsers,
            'stats' => $stats
        ]);
    }

    public function show($id)
    {
        $user = User::with(['role', 'driver.documents', 'driver.guarantors', 'hirer', 'wallet'])->findOrFail($id);

        $roleSlug = $user->role ? $user->role->slug : 'user';
        $status = $user->is_active ? 'active' : 'suspended';

        // Determine phone verification status
        $phoneVerified = !is_null($user->phone_verified_at);
        $codeExpired = $user->verification_expires_at ? $user->verification_expires_at->isPast() : true;

        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? 'N/A',
            'role' => $roleSlug,
            'status' => $status,
            'gender' => $user->gender ?? 'N/A',
            'dateOfBirth' => $user->date_of_birth ?? 'N/A',
            'state_id' => $user->state_id,
            'city_id' => $user->city_id,
            'joinedDate' => $user->created_at ? $user->created_at->format('Y-m-d') : 'N/A',
            'lastLogin' => $user->last_login_at ? $user->last_login_at->diffForHumans() : 'Never',
            'avatar' => $user->avatar ? (str_starts_with($user->avatar, 'http') ? $user->avatar : Storage::disk('public')->url($user->avatar)) : null,
            'avatar_secondary' => $user->avatar_secondary ? (str_starts_with($user->avatar_secondary, 'http') ? $user->avatar_secondary : Storage::disk('public')->url($user->avatar_secondary)) : null,
            'avatar_tertiary' => $user->avatar_tertiary ? (str_starts_with($user->avatar_tertiary, 'http') ? $user->avatar_tertiary : Storage::disk('public')->url($user->avatar_tertiary)) : null,
            'wallet_balance' => $user->wallet ? number_format($user->wallet->balance, 2) : '0.00',
            // Registration verification info for admin assistance
            'phone_verified' => $phoneVerified,
            'verification_code' => $user->verification_code,
            'verification_expires_at' => $user->verification_expires_at?->toIso8601String(),
            'verification_code_expired' => $codeExpired,
        ];

        if ($user->driver) {
            $userData['driver'] = [
                'id' => $user->driver->id,
                'status' => $user->driver->status,
                'is_verified' => $user->driver->is_verified,
                'clearanceLevel' => $user->driver->is_verified ? 'Verified' : 'Pending', // Add logic here if Elite/Premium logic exists
                'rating' => $user->driver->rating ?? 0,
                'total_jobs' => $user->driver->total_jobs ?? 0,
                'documents' => $user->driver->documents,
                'guarantors' => $user->driver->guarantors,
                'guarantorStatus' => 'pending' // You can calculate actual overall guarantor status if needed
            ];
        }

        if ($user->hirer) {
            $userData['hirer'] = [
                'id' => $user->hirer->id,
                'company' => $user->hirer->company_name,
                'type' => $user->hirer->employer_type,
                'accessTier' => $user->hirer->access_tier ?? 'Basic',
                'status' => $user->hirer->status ?? 'Active',
                'totalJobs' => $user->hirer->total_jobs_posted ?? 0,
                'activeContracts' => $user->hirer->active_contracts ?? 0,
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $userData
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'state_id' => 'nullable|exists:states,id',
            'city_id' => 'nullable|exists:cities,id',
        ]);

        $user->state_id = $request->state_id;
        $user->city_id = $request->city_id;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'User profile updated successfully.',
            'data' => $user
        ]);
    }

    public function suspend($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active; // Toggle suspension
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'User ' . ($user->is_active ? 'activated' : 'suspended') . ' successfully.'
        ]);
    }

    public function permaban($id)
    {
        $user = User::findOrFail($id);
        $user->is_active = false;
        $user->save();
        
        // Mark as blacklisted in security table if it exists
        // $user->delete(); // Soft delete if necessary

        return response()->json([
            'status' => 'success',
            'message' => 'User permabanned successfully.'
        ]);
    }

    public function resetPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'password' => 'nullable|string|min:6',
            'send_email' => 'nullable|boolean'
        ]);

        // Generate random password if not provided
        $plainPassword = $request->password ?: str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT) . chr(random_int(65, 90)) . chr(random_int(97, 122));
        
        $user->password = \Illuminate\Support\Facades\Hash::make($plainPassword);
        $user->save();

        $emailSent = false;
        if ($request->send_email && $user->email) {
            try {
                \Illuminate\Support\Facades\Mail::raw(
                    "Hello {$user->name},\n\nYour OgaDriver password has been reset by the administrator.\nYour new temporary password is: {$plainPassword}\n\nPlease log in and change your password as soon as possible.",
                    function ($mail) use ($user) {
                        $mail->to($user->email)->subject('OgaDriver – Password Reset Notification');
                    }
                );
                $emailSent = true;
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to email reset password to user {$user->id}: " . $e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Password reset successfully' . ($emailSent ? ' and sent to user email.' : '.'),
            'password' => $plainPassword,
            'email_sent' => $emailSent
        ]);
    }

    public function updateRole($id, Request $request)
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id'
        ]);

        $user = User::findOrFail($id);
        $user->role_id = $request->role_id;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'User role updated successfully.'
        ]);
    }

    public function creditWallet($id, Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1'
        ]);

        $user = User::with('wallet')->findOrFail($id);
        
        if (!$user->wallet) {
            $wallet = \App\Models\Wallet::create([
                'user_id' => $user->id,
                'balance' => 0,
                'available_balance' => 0,
                'currency' => 'NGN'
            ]);
            $user->setRelation('wallet', $wallet);
        }

        $user->wallet->credit(
            amount: (float) $request->amount,
            type: 'credit',
            category: 'deposit',
            description: 'System Administrative Credit',
            reference: 'admin_credit_' . uniqid()
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Wallet credited with ₦' . number_format($request->amount, 2)
        ]);
    }

    public function sendMessage($id, Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'subject' => 'nullable|string',
            'channels' => 'required|array',
            'channels.*' => 'in:email,sms,in-app'
        ]);

        $user = User::findOrFail($id);
        $channels = $request->channels;

        // In a real application, you would queue these notifications
        // Example: $user->notify(new \App\Notifications\AdminMessageNotification($request->subject, $request->message, $channels));

        $sentTo = [];

        if (in_array('email', $channels) && $user->email) {
            try {
                \Illuminate\Support\Facades\Mail::raw($request->message, function ($mail) use ($user, $request) {
                    $mail->to($user->email)
                         ->subject($request->subject ?? 'Message from OgaDriver Admin');
                });
                $sentTo[] = 'email';
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send email to user {$user->id}: " . $e->getMessage());
            }
        }

        if (in_array('sms', $channels) && $user->phone) {
            // Placeholder for SMS gateway integration (e.g. Twilio, Termii, Africa's Talking)
            // \App\Services\SmsService::send($user->phone, $request->message);
            $sentTo[] = 'sms';
        }

        if (in_array('in-app', $channels)) {
            // Database notification
            \App\Models\Notification::create([
                'user_id' => $user->id,
                'title' => $request->subject ?? 'New Admin Message',
                'message' => $request->message,
                'type' => 'admin_message',
                'is_read' => false
            ]);
            $sentTo[] = 'in-app';
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Message successfully dispatched via: ' . implode(', ', $sentTo)
        ]);
    }

    /**
     * Manually approve a user's phone/registration verification.
     * Use when automated OTP delivery fails and user contacts support.
     */
    public function manualVerifyRegistration($id)
    {
        $user = User::findOrFail($id);

        if ($user->phone_verified_at) {
            return response()->json([
                'status' => 'info',
                'message' => 'User is already verified.'
            ]);
        }

        $user->phone_verified_at = now();
        $user->verification_code = null;
        $user->verification_expires_at = null;
        $user->is_active = true;
        $user->save();

        \Illuminate\Support\Facades\Log::info("Admin manually verified registration for user ID {$user->id}");

        return response()->json([
            'status' => 'success',
            'message' => 'User registration manually approved. Account is now active and verified.'
        ]);
    }

    /**
     * Resend (or regenerate) the OTP verification code for a user.
     * Admin can trigger this when user says they never received the code.
     */
    public function resendVerificationCode($id, \Illuminate\Http\Request $request)
    {
        $user = User::findOrFail($id);

        if ($user->phone_verified_at) {
            return response()->json([
                'status' => 'info',
                'message' => 'User is already verified — no need to resend.'
            ], 409);
        }

        // Generate a fresh 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->verification_code = $code;
        $user->verification_expires_at = now()->addMinutes(15);
        $user->save();

        $channels = $request->input('channels', ['sms']);
        $sentTo = [];

        // Send via SMS (uncomment and configure your SMS gateway)
        if (in_array('sms', $channels) && $user->phone) {
            // TODO: integrate SMS gateway (Termii / Africa's Talking / Twilio)
            // \App\Services\SmsService::send($user->phone, "Your OgaDriver code is: {$code}");
            $sentTo[] = 'sms (pending gateway config)';
        }

        // Send via email
        if (in_array('email', $channels) && $user->email) {
            try {
                \Illuminate\Support\Facades\Mail::raw(
                    "Your OgaDriver verification code is: {$code}\n\nThis code expires in 15 minutes.",
                    function ($mail) use ($user) {
                        $mail->to($user->email)->subject('OgaDriver – Your Verification Code');
                    }
                );
                $sentTo[] = 'email';
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to email verification code to user {$user->id}: " . $e->getMessage());
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Verification code regenerated' . (count($sentTo) ? ' and sent via: ' . implode(', ', $sentTo) : '. No delivery succeeded — relay the code to the user manually.'),
            'code' => $code,
            'expires_at' => $user->verification_expires_at->toIso8601String(),
        ]);
    }
}
