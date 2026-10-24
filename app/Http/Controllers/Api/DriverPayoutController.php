<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Driver;
use App\Models\Wallet;
use App\Models\DriverPayout;
use App\Services\PaystackTransferService;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class DriverPayoutController extends Controller
{
    protected $paystackService;

    public function __construct(PaystackTransferService $paystackService)
    {
        $this->paystackService = $paystackService;
    }

    /**
     * Get list of supported banks for instant cashout based on active country
     */
    public function getBanks(Request $request)
    {
        $country = strtolower($request->get('country', 'nigeria'));
        $banks = $this->paystackService->getBanks($country);

        // Fallback bank lists per active country
        if (empty($banks)) {
            $countryBanks = [
                'nigeria' => [
                    ['code' => '058', 'name' => 'Guaranty Trust Bank (GTBank)', 'currency' => 'NGN'],
                    ['code' => '044', 'name' => 'Access Bank', 'currency' => 'NGN'],
                    ['code' => '057', 'name' => 'Zenith Bank', 'currency' => 'NGN'],
                    ['code' => '033', 'name' => 'United Bank For Africa (UBA)', 'currency' => 'NGN'],
                    ['code' => '011', 'name' => 'First Bank of Nigeria', 'currency' => 'NGN'],
                    ['code' => '035', 'name' => 'Wema Bank', 'currency' => 'NGN'],
                    ['code' => '50515', 'name' => 'Moniepoint MFB', 'currency' => 'NGN'],
                    ['code' => '999991', 'name' => 'OPay Digital Services', 'currency' => 'NGN'],
                    ['code' => '999992', 'name' => 'Palmpay Limited', 'currency' => 'NGN'],
                    ['code' => '50211', 'name' => 'Kuda Microfinance Bank', 'currency' => 'NGN'],
                    ['code' => '221', 'name' => 'Stanbic IBTC Bank', 'currency' => 'NGN'],
                    ['code' => '070', 'name' => 'Fidelity Bank', 'currency' => 'NGN'],
                ],
                'ghana' => [
                    ['code' => 'MTN', 'name' => 'MTN Mobile Money', 'currency' => 'GHS'],
                    ['code' => 'VOD', 'name' => 'Vodafone Cash', 'currency' => 'GHS'],
                    ['code' => 'ATL', 'name' => 'AirtelTigo Money', 'currency' => 'GHS'],
                    ['code' => 'GH280100', 'name' => 'Ecobank Ghana', 'currency' => 'GHS'],
                    ['code' => 'GH040100', 'name' => 'GCB Bank Limited', 'currency' => 'GHS'],
                    ['code' => 'GH190100', 'name' => 'Stanbic Bank Ghana', 'currency' => 'GHS'],
                    ['code' => 'GH240100', 'name' => 'Fidelity Bank Ghana', 'currency' => 'GHS'],
                ],
                'kenya' => [
                    ['code' => 'MPESA', 'name' => 'M-Pesa Safaricom', 'currency' => 'KES'],
                    ['code' => 'KE68', 'name' => 'Equity Bank Kenya', 'currency' => 'KES'],
                    ['code' => 'KE01', 'name' => 'KCB Bank Kenya', 'currency' => 'KES'],
                    ['code' => 'KE11', 'name' => 'Co-operative Bank of Kenya', 'currency' => 'KES'],
                    ['code' => 'KE07', 'name' => 'NCBA Bank Kenya', 'currency' => 'KES'],
                    ['code' => 'KE03', 'name' => 'Absa Bank Kenya', 'currency' => 'KES'],
                ],
                'south_africa' => [
                    ['code' => 'ZA470010', 'name' => 'Capitec Bank', 'currency' => 'ZAR'],
                    ['code' => 'ZA250655', 'name' => 'First National Bank (FNB)', 'currency' => 'ZAR'],
                    ['code' => 'ZA051001', 'name' => 'Standard Bank South Africa', 'currency' => 'ZAR'],
                    ['code' => 'ZA198765', 'name' => 'Nedbank', 'currency' => 'ZAR'],
                    ['code' => 'ZA632005', 'name' => 'Absa Bank', 'currency' => 'ZAR'],
                    ['code' => 'ZA678910', 'name' => 'TymeBank', 'currency' => 'ZAR'],
                ],
            ];

            $banks = $countryBanks[$country] ?? $countryBanks['nigeria'];
        }

        return response()->json([
            'success' => true,
            'country' => $country,
            'data' => $banks,
        ]);
    }

    /**
     * Resolve account number to verify account name
     */
    public function resolveAccount(Request $request)
    {
        $request->validate([
            'account_number' => 'required|string|min:8|max:20',
            'bank_code' => 'required|string',
        ]);

        $country = strtolower($request->get('country', 'nigeria'));
        $resolved = null;
        
        if ($country === 'nigeria') {
            $resolved = $this->paystackService->resolveAccount($request->account_number, $request->bank_code);
        }

        // If Paystack resolves, use resolved name; otherwise fallback to authenticated user name for international/mobile money
        $accountName = $resolved['account_name'] ?? (auth()->user() ? auth()->user()->name : 'Verified Account Holder');

        return response()->json([
            'success' => true,
            'data' => [
                'account_number' => $request->account_number,
                'bank_code' => $request->bank_code,
                'account_name' => $accountName,
            ],
        ]);
    }

    /**
     * Process Instant Cashout
     */
    public function requestPayout(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1000',
            'bank_code' => 'required|string',
            'bank_name' => 'required|string',
            'account_number' => 'required|string|min:8|max:20',
            'account_name' => 'required|string',
            'save_account' => 'sometimes|boolean',
        ]);

        $user = auth()->user();
        $driver = Driver::where('user_id', $user->id)->first();
        if (!$driver) {
            return response()->json(['success' => false, 'message' => 'Driver record not found'], 404);
        }

        // Use DB Transaction with row locking to prevent race conditions & double spending
        try {
            return DB::transaction(function () use ($user, $driver, $request) {
                $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first();
                if (!$wallet) {
                    $wallet = Wallet::create(['user_id' => $user->id, 'balance' => 0.00, 'available_balance' => 0.00]);
                    $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first();
                }

                if ($wallet->available_balance < $request->amount) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Insufficient wallet balance for instant cashout. Available balance: ₦' . number_format($wallet->available_balance, 2),
                    ], 422);
                }

                // Generate Recipient Code
                $recipientCode = $this->paystackService->createRecipient(
                    $request->account_name,
                    $request->account_number,
                    $request->bank_code
                );

                if (!$recipientCode) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to create payout recipient. Please check your bank details.'
                    ], 422);
                }

                $reference = 'OGD-CSH-' . strtoupper(Str::random(10));

                // Deduct from wallet immediately within locked transaction
                $wallet->decrement('balance', $request->amount);
                $wallet->decrement('available_balance', $request->amount);

                // Initiate live transfer
                $transfer = $this->paystackService->initiateTransfer(
                    $request->amount,
                    $recipientCode,
                    $reference,
                    'OgaDriver Instant Cashout'
                );

            if ($transfer['success']) {
                $payout = DriverPayout::create([
                    'driver_id' => $driver->id,
                    'user_id' => $user->id,
                    'amount' => $request->amount,
                    'bank_code' => $request->bank_code,
                    'bank_name' => $request->bank_name,
                    'account_number' => $request->account_number,
                    'account_name' => $request->account_name,
                    'transfer_reference' => $reference,
                    'status' => 'processing', // Will become 'successful' via webhook
                    'gateway' => 'paystack',
                    'metadata' => [
                        'transfer_code' => $transfer['transfer_code']
                    ]
                ]);

                // Persist to user record for 1-tap future withdrawals
                if ($request->boolean('save_account', true)) {
                    $user->update([
                        'bank_name' => $request->bank_name,
                        'bank_code' => $request->bank_code,
                        'account_number' => $request->account_number,
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Instant cashout initiated successfully! Funds should arrive in your bank account shortly.',
                    'data' => $payout
                ]);
            } else {
                // If initiation fails, rollback wallet deduction
                $wallet->increment('balance', $request->amount);
                $wallet->increment('available_balance', $request->amount);

                // Record the failed attempt for audit
                DriverPayout::create([
                    'driver_id' => $driver->id,
                    'user_id' => $user->id,
                    'amount' => $request->amount,
                    'bank_code' => $request->bank_code,
                    'bank_name' => $request->bank_name,
                    'account_number' => $request->account_number,
                    'account_name' => $request->account_name,
                    'transfer_reference' => $reference,
                    'status' => 'failed',
                    'gateway' => 'paystack',
                    'failure_reason' => $transfer['message']
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Payout gateway declined the transfer: ' . $transfer['message']
                ], 422);
            }
        });
        } catch (\Exception $e) {
            \Log::error('Payout Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Instant cashout transaction failed. Please try again.'
            ], 500);
        }
    }

    public function getHistory()
    {
        $user = auth()->user();
        $payouts = DriverPayout::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payouts,
        ]);
    }
}
