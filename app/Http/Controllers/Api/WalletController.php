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
     * Initialize a real Paystack checkout for wallet top-up.
     */
    public function topUp(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100|max:5000000',
        ]);

        $user = Auth::user();

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
}

