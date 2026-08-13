<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(protected PaymentService $paymentService) {}

    /**
     * Handle Paystack webhook events.
     */
    public function handlePaymentNotification(Request $request)
    {
        $signature = $request->header('x-paystack-signature');
        $secret = config('services.paystack.secret_key');

        // Prefer Paystack HMAC; fall back to shared webhook secret for custom providers.
        if ($secret && $signature) {
            $computed = hash_hmac('sha512', $request->getContent(), $secret);
            if (!hash_equals($computed, $signature)) {
                return response()->json(['message' => 'Invalid signature'], 401);
            }
        } elseif ($request->header('X-Provider-Signature')) {
            if ($request->header('X-Provider-Signature') !== config('services.payment.webhook_secret')) {
                return response()->json(['message' => 'Unauthorized Access Attempt'], 401);
            }
        } else {
            return response()->json(['message' => 'Missing payment signature'], 401);
        }

        $event = $request->input('event');
        $data = $request->input('data', []);
        $reference = $data['reference'] ?? $request->input('reference');

        if (!$reference) {
            return response()->json(['message' => 'Missing reference'], 400);
        }

        // Only fulfill successful charge events from Paystack
        if ($event && !in_array($event, ['charge.success', 'payment.success'], true)) {
            return response()->json(['message' => 'Event ignored', 'event' => $event], 200);
        }

        try {
            $payment = Payment::where('reference', $reference)->first();

            if (!$payment) {
                Log::warning('Payment webhook for unknown reference', ['reference' => $reference]);
                return response()->json(['message' => 'Unknown reference'], 404);
            }

            if ($payment->isSuccessful()) {
                return response()->json(['message' => 'Already processed'], 200);
            }

            $this->paymentService->verifyAndFulfill($reference);

            return response()->json(['status' => 'SUCCESS', 'message' => 'Payment fulfilled'], 200);
        } catch (\Throwable $e) {
            Log::error('Payment webhook failed', [
                'reference' => $reference,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'FAILED',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
