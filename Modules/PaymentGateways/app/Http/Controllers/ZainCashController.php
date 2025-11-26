<?php

namespace Modules\PaymentGateways\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\Course\CourseCartService;
use App\Services\Course\CourseCouponService;
use App\Services\Payment\PaymentService;
use App\Services\SettingsService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ZainCashController extends Controller
{
    private $zainCash;
    private $merchantId;
    private $secretKey;
    private $sandboxMode;

    public function __construct(
        private CourseCouponService $couponService,
        private CourseCartService $cartService,
        private SettingsService $settingsService,
        private PaymentService $paymentService
    ) {
        $this->zainCash = $this->settingsService->getSetting(['type' => 'payment', 'sub_type' => 'zain_cash']);
        $this->merchantId = $this->zainCash->fields['merchant_id'] ?? '';
        $this->secretKey = $this->zainCash->fields['secret_key'] ?? '';
        $this->sandboxMode = $this->zainCash->fields['sandbox_mode'] ?? true;
    }

    /**
     * Initialize Zain Cash payment
     */
    public function payment(Request $request)
    {
        $cart = $this->cartService->getCartItems(Auth::user()->id);
        $coupon = $this->couponService->getCoupon($request->coupon);
        $calculatedCart = $this->cartService->calculateCart($cart, $coupon);

        $amount = $calculatedCart['totalPrice'];
        $orderId = 'ORDER-' . time() . '-' . Auth::id();

        // Zain Cash API endpoint
        $apiUrl = $this->sandboxMode
            ? 'https://test.zaincash.iq/transaction/init'
            : 'https://api.zaincash.iq/transaction/init';

        // Prepare transaction data
        $transactionData = [
            'amount' => $amount * 1000, // Zain Cash uses fils (1 IQD = 1000 fils)
            'serviceType' => 'Beta E-Learning',
            'msisdn' => Auth::user()->phone ?? '',
            'orderId' => $orderId,
            'redirectUrl' => route('payments.zaincash.callback'),
            'production' => !$this->sandboxMode,
            'lang' => app()->getLocale() === 'ar' ? 'ar' : 'en',
        ];

        // Create JWT token for Zain Cash
        $token = $this->createJwtToken($transactionData);

        try {
            // Make API request to Zain Cash
            $response = $this->makeApiRequest($apiUrl, [
                'token' => $token,
                'merchantId' => $this->merchantId,
                'lang' => $transactionData['lang'],
            ]);

            if (isset($response['id'])) {
                // Store transaction details in session
                session()->put('zain_cash_transaction_id', $response['id']);
                session()->put('zain_cash_order_id', $orderId);
                session()->put('slug', $request->slug);
                session()->put('taxAmount', $calculatedCart['taxAmount']);
                session()->put('couponCode', $coupon ? $coupon->code : null);

                // Redirect to Zain Cash payment page
                $paymentUrl = $this->sandboxMode
                    ? 'https://test.zaincash.iq/transaction/pay?id=' . $response['id']
                    : 'https://api.zaincash.iq/transaction/pay?id=' . $response['id'];

                return redirect()->away($paymentUrl);
            } else {
                throw new \Exception('Failed to initialize Zain Cash transaction');
            }
        } catch (\Exception $e) {
            Log::error('Zain Cash payment initialization failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return redirect()
                ->route('payments.index', ['slug' => $request->slug])
                ->with('error', 'Payment initialization failed. Please try again.');
        }
    }

    /**
     * Handle Zain Cash callback
     */
    public function callback(Request $request)
    {
        $slug = session()->get('slug');
        $transactionId = session()->get('zain_cash_transaction_id');
        $orderId = session()->get('zain_cash_order_id');
        $taxAmount = session()->get('taxAmount');
        $couponCode = session()->get('couponCode');

        try {
            // Get transaction ID from request
            $token = $request->get('token');

            if (!$token) {
                throw new \Exception('No transaction token received');
            }

            // Verify transaction with Zain Cash
            $apiUrl = $this->sandboxMode
                ? 'https://test.zaincash.iq/transaction/get'
                : 'https://api.zaincash.iq/transaction/get';

            $response = $this->makeApiRequest($apiUrl, [
                'token' => $token,
                'merchantId' => $this->merchantId,
            ]);

            if (isset($response['status']) && $response['status'] === 'success') {
                $amount = $response['amount'] / 1000; // Convert fils to IQD

                // Process the payment
                $this->paymentService->coursesBuy(
                    'zaincash',
                    $response['id'],
                    $taxAmount,
                    $amount,
                    $couponCode
                );

                // Clear session
                session()->forget(['zain_cash_transaction_id', 'zain_cash_order_id', 'taxAmount', 'couponCode']);

                if ($slug == 'api') {
                    return redirect()->to(env('FRONTEND_URL') . '/student');
                } else {
                    return redirect()
                        ->route('student.index', ['tab' => 'courses'])
                        ->with('success', 'Payment completed successfully via Zain Cash!');
                }
            } else {
                throw new \Exception('Transaction verification failed');
            }
        } catch (\Exception $e) {
            Log::error('Zain Cash callback failed', [
                'error' => $e->getMessage(),
                'transaction_id' => $transactionId,
            ]);

            return redirect()
                ->route('payments.index', ['slug' => $slug])
                ->with('error', 'Payment verification failed. Please contact support.');
        }
    }

    /**
     * Handle Zain Cash payment cancellation
     */
    public function cancel()
    {
        $slug = session()->get('slug');
        session()->forget(['zain_cash_transaction_id', 'zain_cash_order_id', 'taxAmount', 'couponCode']);

        return redirect()
            ->route('payments.index', ['slug' => $slug])
            ->with('error', 'Payment was cancelled.');
    }

    /**
     * Create JWT token for Zain Cash API
     */
    private function createJwtToken(array $data): string
    {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($data);

        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secretKey, true);
        $base64UrlSignature = $this->base64UrlEncode($signature);

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Base64 URL encode
     */
    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Make API request to Zain Cash
     */
    private function makeApiRequest(string $url, array $data): array
    {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new \Exception('Zain Cash API request failed with HTTP code: ' . $httpCode);
        }

        $result = json_decode($response, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Failed to parse Zain Cash API response');
        }

        return $result;
    }
}
