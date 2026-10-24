<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class WalletController extends Controller
{
    public function __construct(protected PaymentService $paymentService) {}

    /**
     * Get the authenticated user's wallet details and recent transactions.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $wallet = $user->wallet;
        if (!$wallet) {
            $wallet = Wallet::create([
                'user_id' => $user->id,
                'balance' => 0,
                'available_balance' => 0,
                'currency' => 'NGN',
            ]);
        }

        $transactions = $wallet->transactions()
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get();

        return response()->json([
            'success' => true,
            'wallet' => [
                'balance' => $wallet->balance,
                'available_balance' => $wallet->available_balance,
                'currency' => $wallet->currency,
            ],
            'data' => [
                'balance' => $wallet->balance,
                'available_balance' => $wallet->available_balance,
                'currency' => $wallet->currency,
            ],
            'transactions' => $transactions,
            'payment_gateway_configured' => $this->paymentService->isConfigured(),
        ]);
    }

    /**
     * Determine minimum credit amount based on country/currency.
     * Nigeria (NGN): 5,000 NGN
     * US (USD) & UK (GBP): 50 USD / 50 GBP
     * Other international: 5 USD equivalent
     */
    protected function getMinimumCreditRequirement(User $user, ?string $currency = null): array
    {
        $curr = strtoupper($currency ?: ($user->wallet?->currency ?: 'NGN'));
        $countryCode = strtoupper($user->country_code ?: ($user->driver?->country_code ?: 'NG'));

        if ($curr === 'NGN' || $countryCode === 'NG') {
            return [
                'min_amount' => 5000.0,
                'currency' => 'NGN',
                'symbol' => '₦',
                'label' => '₦5,000',
            ];
        }

        if (in_array($curr, ['USD', 'GBP']) || in_array($countryCode, ['US', 'USA', 'GB', 'UK'])) {
            return [
                'min_amount' => 50.0,
                'currency' => $curr === 'GBP' ? 'GBP' : 'USD',
                'symbol' => $curr === 'GBP' ? '£' : '$',
                'label' => $curr === 'GBP' ? '£50' : '$50',
            ];
        }

        return [
            'min_amount' => 5.0,
            'currency' => $curr ?: 'USD',
            'symbol' => '$',
            'label' => '$5',
        ];
    }

    /**
     * Initialize a real Paystack / Gateway checkout for wallet top-up.
     */
    public function topUp(Request $request)
    {
        $user = Auth::user();
        $minReq = $this->getMinimumCreditRequirement($user, $request->input('currency'));

        $request->validate([
            'amount' => 'required|numeric|min:' . $minReq['min_amount'] . '|max:5000000',
        ], [
            'amount.min' => "The minimum account credit amount is {$minReq['label']} for {$minReq['currency']}.",
        ]);

        try {
            $payment = $this->paymentService->initialize(
                user: $user,
                amount: (float) $request->amount,
                purpose: 'wallet_topup',
                metadata: [
                    'wallet_topup' => true,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Redirect to payment gateway to complete top-up.',
                'payment_required' => true,
                'authorization_url' => $payment->authorization_url,
                'reference' => $payment->reference,
                'amount' => (float) $payment->amount,
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'insufficient_balance' => false,
                'credit_wallet' => true,
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Top-up failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lookup a user by phone or email for wallet gift / book-for-other.
     */
    public function lookupRecipient(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:3|max:120',
        ]);

        $q = trim($request->input('query'));
        $digits = preg_replace('/\D+/', '', $q);

        $user = User::query()
            ->where(function ($builder) use ($q, $digits) {
                $builder->where('email', $q);
                if ($digits !== '') {
                    $builder->orWhere('phone', $q)
                        ->orWhere('phone', 'like', '%' . substr($digits, -10));
                }
            })
            ->where('is_active', true)
            ->first(['id', 'name', 'email', 'phone', 'avatar']);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No OgaDriver user found with that phone or email.',
            ], 404);
        }

        if ($user->id === Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot select yourself as recipient.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    /**
     * Transfer / credit another user's wallet from the sender's wallet balance.
     */
    public function transfer(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100|max:2000000',
            'recipient_user_id' => 'nullable|exists:users,id',
            'recipient_phone' => 'nullable|string|max:32',
            'recipient_email' => 'nullable|email|max:255',
            'note' => 'nullable|string|max:255',
        ]);

        $sender = Auth::user();
        $sender->loadMissing('wallet');

        if (!$sender->wallet) {
            $sender->wallet()->create([
                'balance' => 0,
                'available_balance' => 0,
                'currency' => 'NGN',
            ]);
            $sender->load('wallet');
        }

        $amount = (float) $request->amount;
        $recipient = null;

        if ($request->filled('recipient_user_id')) {
            $recipient = User::find($request->recipient_user_id);
        } elseif ($request->filled('recipient_email')) {
            $recipient = User::where('email', $request->recipient_email)->first();
        } elseif ($request->filled('recipient_phone')) {
            $phone = $request->recipient_phone;
            $digits = preg_replace('/\D+/', '', $phone);
            $recipient = User::where('phone', $phone)
                ->orWhere('phone', 'like', '%' . substr($digits, -10))
                ->first();
        }

        if (!$recipient) {
            return response()->json([
                'success' => false,
                'message' => 'Recipient not found. Enter a registered phone or email.',
            ], 404);
        }

        if ($recipient->id === $sender->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot credit your own wallet this way. Use Credit Wallet / Top-up.',
            ], 422);
        }

        if (!$sender->wallet->hasAvailableBalance($amount)) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance. Please credit your account.',
                'insufficient_balance' => true,
                'credit_wallet' => true,
                'wallet' => [
                    'balance' => (float) $sender->wallet->balance,
                    'available_balance' => (float) $sender->wallet->available_balance,
                ],
                'required_amount' => $amount,
            ], 422);
        }

        $note = $request->input('note') ?: 'Wallet gift';
        $ref = 'xfer_' . uniqid();

        try {
            DB::transaction(function () use ($sender, $recipient, $amount, $note, $ref) {
                $senderWallet = Wallet::where('user_id', $sender->id)->lockForUpdate()->first();
                if (!$senderWallet->hasAvailableBalance($amount)) {
                    throw new \App\Exceptions\InsufficientFundsException('Insufficient wallet balance');
                }

                $recipientWallet = Wallet::firstOrCreate(
                    ['user_id' => $recipient->id],
                    ['balance' => 0, 'available_balance' => 0, 'currency' => 'NGN']
                );
                $recipientWallet = Wallet::where('id', $recipientWallet->id)->lockForUpdate()->first();

                $senderWallet->debit(
                    $amount,
                    'debit',
                    'transfer_out',
                    'Transfer to ' . ($recipient->name ?: $recipient->phone) . ' — ' . $note,
                    $ref . '_out'
                );

                $recipientWallet->credit(
                    $amount,
                    'credit',
                    'transfer_in',
                    'Received from ' . ($sender->name ?: $sender->phone) . ' — ' . $note,
                    $ref . '_in'
                );
            });
        } catch (\App\Exceptions\InsufficientFundsException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance. Please credit your account.',
                'insufficient_balance' => true,
                'credit_wallet' => true,
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Transfer failed: ' . $e->getMessage(),
            ], 500);
        }

        $sender->wallet->refresh();

        return response()->json([
            'success' => true,
            'message' => '₦' . number_format($amount, 2) . ' credited to ' . ($recipient->name ?: 'user') . '.',
            'wallet' => [
                'balance' => (float) $sender->wallet->balance,
                'available_balance' => (float) $sender->wallet->available_balance,
            ],
            'recipient' => [
                'id' => $recipient->id,
                'name' => $recipient->name,
                'phone' => $recipient->phone,
            ],
            'amount' => $amount,
        ]);
    }

    /**
     * Request an automated payout to a bank account.
     */
    public function requestPayout(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:500',
            'bank_code' => 'required|string',
            'account_number' => 'required|string'
        ]);

        $user = Auth::user();
        $wallet = $user->wallet;

        if (!$wallet || $wallet->balance < $request->amount) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient wallet balance.'
            ], 422);
        }

        try {
            // Deduct from wallet immediately
            $wallet->decrement('balance', $request->amount);

            // Create payout record
            $wallet->transactions()->create([
                'type' => 'withdrawal',
                'amount' => $request->amount,
                'reference' => 'wdr_' . \Illuminate\Support\Str::random(10),
                'description' => 'Automated Bank Payout',
                'status' => 'processing',
            ]);

            // Call automated payout API
            $response = $this->paymentService->processTransfer(
                $user,
                (float) $request->amount,
                $request->bank_code,
                $request->account_number
            );

            return response()->json([
                'success' => true,
                'message' => 'Payout processed successfully. Funds are on the way to your bank account.'
            ]);

        } catch (RuntimeException $e) {
            // Rollback deduction if API call fails
            $wallet->increment('balance', $request->amount);
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    /**
     * Purchase Hire Points using wallet balance.
     * Rate: e.g. ₦150 per point (2 points = ₦300), or configured cost.
     */
    public function purchaseHirePoints(Request $request)
    {
        $request->validate([
            'points' => 'required|integer|min:1|max:100',
        ]);

        $user = Auth::user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Only registered drivers can purchase Hire Points.',
            ], 403);
        }

        $points = (int) $request->input('points');
        $costPerPoint = (float) \App\Models\ApiSetting::getValue('cost_per_hire_point', 150.0); // ₦150 per point, so 2 points = ₦300
        $totalCost = $points * $costPerPoint;

        $wallet = $user->wallet;
        if (!$wallet || $wallet->available_balance < $totalCost) {
            return response()->json([
                'success' => false,
                'insufficient_balance' => true,
                'required_amount' => $totalCost,
                'available_balance' => (float) ($wallet?->available_balance ?? 0),
                'cost_per_point' => $costPerPoint,
                'message' => "Insufficient wallet balance. You need ₦" . number_format($totalCost, 2) . " to buy {$points} Hire Points. Please credit your wallet.",
            ], 422);
        }

        return DB::transaction(function () use ($wallet, $driver, $points, $totalCost, $costPerPoint) {
            // Deduct from wallet
            $wallet->debit(
                $totalCost,
                'debit',
                'hire_points',
                "Purchased {$points} Hire Point(s) for job applications"
            );

            // Credit driver's hire points
            $balanceBefore = (int) ($driver->hire_points ?? 0);
            $balanceAfter = $balanceBefore + $points;
            $driver->hire_points = $balanceAfter;
            $driver->save();

            // Record transaction
            \App\Models\HirePointTransaction::create([
                'driver_id' => $driver->id,
                'type' => 'credit',
                'points' => $points,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'reason' => 'wallet_purchase',
                'cost_amount' => $totalCost,
                'currency' => $wallet->currency ?: 'NGN',
            ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully purchased {$points} Hire Point(s)! Total points balance: {$balanceAfter}",
                'hire_points' => $balanceAfter,
                'points_added' => $points,
                'cost' => $totalCost,
                'wallet_balance' => (float) $wallet->fresh()->available_balance,
            ]);
        });
    }

    /**
     * Get Driver's Hire Points status and point history.
     */
    public function getHirePointsStatus(Request $request)
    {
        $user = Auth::user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver profile not found'], 404);
        }

        $hireModel = \App\Models\ApiSetting::getValue('hire_monetization_mode', 'driver_points');
        $pointsPerApp = (int) \App\Models\ApiSetting::getValue('points_per_hire_application', 2);
        $costPerPoint = (float) \App\Models\ApiSetting::getValue('cost_per_hire_point', 150.0);

        $transactions = \App\Models\HirePointTransaction::where('driver_id', $driver->id)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        return response()->json([
            'success' => true,
            'hire_points' => (int) ($driver->hire_points ?? 0),
            'points_per_application' => $pointsPerApp,
            'cost_per_point' => $costPerPoint,
            'cost_for_application' => $pointsPerApp * $costPerPoint, // e.g. ₦300
            'monetization_mode' => $hireModel,
            'transactions' => $transactions,
        ]);
    }
}

