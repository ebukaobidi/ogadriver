<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaystackTransferService
{
    protected $secretKey;
    protected $baseUrl = 'https://api.paystack.co';

    public function __construct()
    {
        $this->secretKey = env('PAYSTACK_SECRET_KEY');
    }

    /**
     * Get list of banks from Paystack for given country
     */
    public function getBanks($country = 'nigeria')
    {
        try {
            $response = Http::withToken($this->secretKey)
                ->get($this->baseUrl . '/bank', ['country' => strtolower($country)]);

            if ($response->successful()) {
                return $response->json()['data'] ?? [];
            }
            return [];
        } catch (\Exception $e) {
            Log::error('Paystack Get Banks Failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    public function resolveAccount($accountNumber, $bankCode)
    {
        try {
            if (empty($this->secretKey)) {
                Log::info("Paystack secret key is unconfigured. Returning sandbox verified account for {$accountNumber}");
                return [
                    'account_number' => $accountNumber,
                    'account_name' => 'VERIFIED PARTNER HOLDER',
                    'bank_id' => $bankCode
                ];
            }

            $response = Http::withToken($this->secretKey)
                ->timeout(12)
                ->get($this->baseUrl . '/bank/resolve', [
                    'account_number' => $accountNumber,
                    'bank_code' => $bankCode
                ]);

            if ($response->successful()) {
                return $response->json()['data'] ?? null;
            }

            Log::warning('Paystack Resolve Account Unsuccessful', ['response' => $response->json()]);
            return null;
        } catch (\Exception $e) {
            Log::error('Paystack Resolve Account Exception', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Create a transfer recipient on Paystack
     * 
     * @param string $name
     * @param string $accountNumber
     * @param string $bankCode
     * @return string|null Recipient Code or null on failure
     */
    public function createRecipient($name, $accountNumber, $bankCode)
    {
        try {
            $response = Http::withToken($this->secretKey)
                ->post($this->baseUrl . '/transferrecipient', [
                    'type' => 'nuban',
                    'name' => $name,
                    'account_number' => $accountNumber,
                    'bank_code' => $bankCode,
                    'currency' => 'NGN'
                ]);

            $result = $response->json();

            if ($response->successful() && isset($result['data']['recipient_code'])) {
                return $result['data']['recipient_code'];
            }

            Log::error('Paystack Create Recipient Failed', ['response' => $result]);
            return null;
        } catch (\Exception $e) {
            Log::error('Paystack Create Recipient Exception', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Initiate the actual fund transfer
     * 
     * @param float $amount Amount in Naira
     * @param string $recipientCode
     * @param string $reference
     * @param string $reason
     * @return array
     */
    public function initiateTransfer($amount, $recipientCode, $reference, $reason = 'OgaDriver Withdrawal')
    {
        try {
            // Paystack expects amount in Kobo
            $amountInKobo = (int) round($amount * 100);

            $response = Http::withToken($this->secretKey)
                ->post($this->baseUrl . '/transfer', [
                    'source' => 'balance',
                    'amount' => $amountInKobo,
                    'reference' => $reference,
                    'recipient' => $recipientCode,
                    'reason' => $reason
                ]);

            $result = $response->json();

            if ($response->successful() && $result['status'] === true) {
                return [
                    'success' => true,
                    'status' => $result['data']['status'] ?? 'processing',
                    'transfer_code' => $result['data']['transfer_code'] ?? null,
                    'message' => $result['message']
                ];
            }

            return [
                'success' => false,
                'message' => $result['message'] ?? 'Transfer initiation failed'
            ];
        } catch (\Exception $e) {
            Log::error('Paystack Initiate Transfer Exception', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Connection to payment gateway failed'
            ];
        }
    }
}
