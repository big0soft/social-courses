<?php

return [
    'sslcommerz' => [
        'apiCredentials' => [
            'store_id' => env("SSLCZ_STORE_ID"),
            'store_password' => env("SSLCZ_STORE_PASSWORD"),
        ],
        'apiUrl' => [
            'make_payment' => "/gwprocess/v4/api.php",
            'transaction_status' => "/validator/api/merchantTransIDvalidationAPI.php",
            'order_validate' => "/validator/api/validationserverAPI.php",
            'refund_payment' => "/validator/api/merchantTransIDvalidationAPI.php",
            'refund_status' => "/validator/api/merchantTransIDvalidationAPI.php",
        ],
        'apiDomain' => "https://securepay.sslcommerz.com",
        'connect_from_localhost' => env("IS_LOCALHOST", false), // For Sandbox, use "true", For Live, use "false"
        'success_url' => '/payments/sslcommerz/success',
        'failed_url' => '/payments/sslcommerz/fail',
        'cancel_url' => '/payments/sslcommerz/cancel',
        'ipn_url' => '/payments/sslcommerz/ipn',
    ],
    'zaincash' => [
        'merchant_id' => env('ZAIN_CASH_MERCHANT_ID'),
        'secret_key' => env('ZAIN_CASH_SECRET_KEY'),
        'sandbox_mode' => env('ZAIN_CASH_SANDBOX_MODE', true),
        'api_url' => env('ZAIN_CASH_SANDBOX_MODE', true)
            ? 'https://test.zaincash.iq/transaction'
            : 'https://api.zaincash.iq/transaction',
        'success_url' => '/payments/zaincash/callback',
        'cancel_url' => '/payments/zaincash/cancel',
        'language' => env('ZAIN_CASH_LANGUAGE', 'en'), // en or ar
        'currency' => 'IQD',
    ],
];
