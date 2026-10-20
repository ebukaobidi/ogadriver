<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use RuntimeException;

class PaymentController extends Controller
{
    public function __construct(protected PaymentService $paymentService) {}

    /**
     * Verify a payment after Paystack redirect (authenticated).
     */
    public function verify(Request $request)
    {
        $request->validate([
            'reference' => 'required|string',
        ]);

        $payment = Payment::where('reference', $request->reference)->first();

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found.',
            ], 404);
        }

        if ($request->user() && (int) $payment->user_id !== (int) $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized payment reference.',
            ], 403);
        }

        try {
            $payment = $this->paymentService->verifyAndFulfill($request->reference);

            return response()->json([
                'success' => true,
                'message' => 'Payment verified successfully.',
                'payment' => $payment,
                'purpose' => $payment->purpose,
                'status' => $payment->status,
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Verification failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function initiateVerificationFee(Request $request)
    {
        $user = $request->user();

        if (!$user->isDriver()) {
            return response()->json(['message' => 'Only drivers can pay verification fee.'], 403);
        }

        if ($user->driver->verification_fee_paid) {
            return response()->json(['message' => 'Verification fee already paid.'], 400);
        }

        try {
            $payment = $this->paymentService->initialize($user, 3000, 'verification_fee');
            return response()->json([
                'success' => true,
                'payment' => $payment
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Public browser callback from Paystack — redirects back to the SPA.
     */
    public function callback(Request $request)
    {
        $reference = $request->query('reference') ?: $request->query('trxref');
        $frontend = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');

        if (!$reference) {
            return redirect($frontend . '/driver?tab=billing&payment=failed&reason=missing_reference');
        }

        try {
            $payment = $this->paymentService->verifyAndFulfill($reference);
            $user = $payment->user;
            $user?->loadMissing('role');
            $rolePath = ($user && $user->isHirer()) ? '/employer' : '/driver';

            return redirect($frontend . $rolePath . '?tab=billing&payment=success&reference=' . urlencode($reference));
        } catch (\Throwable $e) {
            return redirect($frontend . '/driver?tab=billing&payment=failed&reference=' . urlencode($reference) . '&reason=' . urlencode($e->getMessage()));
        }
    }
}
