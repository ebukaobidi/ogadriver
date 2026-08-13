<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Top-up failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
