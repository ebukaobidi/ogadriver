<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DriverPayout;
use App\Models\PerkRedemption;
use Illuminate\Support\Facades\DB;

class BatchPayoutController extends Controller
{
    /**
     * Get pending cashouts & payout requests
     */
    public function getPendingPayouts()
    {
        $payouts = DriverPayout::with(['user', 'driver'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $payouts,
        ]);
    }

    /**
     * 1-Click Batch Approval & Transfer Dispatch
     */
    public function batchApprove(Request $request, \App\Services\PaystackTransferService $paystackService)
    {
        $request->validate([
            'payout_ids' => 'required|array',
            'payout_ids.*' => 'exists:driver_payouts,id',
        ]);

        $approvedCount = 0;
        $failedCount = 0;
        $totalAmount = 0;

        $payouts = DriverPayout::whereIn('id', $request->payout_ids)->where('status', 'pending')->get();

        foreach ($payouts as $payout) {
            // 1. Create Recipient on Paystack
            $recipientCode = $paystackService->createRecipient(
                $payout->account_name,
                $payout->account_number,
                $payout->bank_code
            );

            if (!$recipientCode) {
                $payout->update([
                    'status' => 'failed',
                    'failure_reason' => 'Failed to resolve bank account details on Paystack.'
                ]);
                $failedCount++;
                continue;
            }

            // 2. Initiate Transfer
            $transfer = $paystackService->initiateTransfer(
                $payout->amount,
                $recipientCode,
                $payout->transfer_reference,
                'OgaDriver Earnings Withdrawal'
            );

            if ($transfer['success']) {
                $payout->update([
                    'status' => 'processing', // Will be marked 'successful' via webhook later, or we can assume success for now
                    'metadata' => array_merge($payout->metadata ?? [], [
                        'batch_approved_by' => auth()->id(),
                        'approved_at' => now()->toDateTimeString(),
                        'transfer_code' => $transfer['transfer_code']
                    ]),
                ]);
                $approvedCount++;
                $totalAmount += $payout->amount;
            } else {
                $payout->update([
                    'status' => 'failed',
                    'failure_reason' => $transfer['message']
                ]);
                $failedCount++;
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "Successfully initiated {$approvedCount} transfers totaling ₦" . number_format($totalAmount, 2) . ". " . ($failedCount > 0 ? "{$failedCount} transfers failed." : ""),
        ]);
    }
}
