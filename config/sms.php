<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SMS Provider
    |--------------------------------------------------------------------------
    |
    | Supported: "twilio", "nexmo", "disabled"
    |
    */
    'provider' => env('SMS_PROVIDER', 'disabled'),

    /*
    |--------------------------------------------------------------------------
    | SMS Enabled
    |--------------------------------------------------------------------------
    |
    | Enable or disable SMS functionality globally
    |
    */
    'enabled' => env('SMS_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Twilio Configuration
    |--------------------------------------------------------------------------
    |
    | Twilio API credentials for SMS sending
    |
    */
    'twilio' => [
        'sid' => env('TWILIO_SID', ''),
        'token' => env('TWILIO_TOKEN', ''),
        'from' => env('TWILIO_FROM', ''),
    ],

    /*
    |--------------------------------------------------------------------------
    | Nexmo/Vonage Configuration
    |--------------------------------------------------------------------------
    |
    | Nexmo/Vonage API credentials for SMS sending
    |
    */
    'nexmo' => [
        'key' => env('NEXMO_KEY', ''),
        'secret' => env('NEXMO_SECRET', ''),
        'from' => env('NEXMO_FROM', ''),
    ],

    /*
    |--------------------------------------------------------------------------
    | SMS Templates
    |--------------------------------------------------------------------------
    |
    | Default SMS message templates
    |
    */
    'templates' => [
        'card_activation' => 'Your Beta E-Learning prepaid card :code has been successfully activated! You now have access to :courses_count course(s). Visit :url to start learning.',

        'payment_confirmation' => 'Payment of :amount :currency received successfully. Your enrollment has been activated. Thank you for choosing Beta E-Learning!',

        'account_activation' => 'Welcome to Beta E-Learning! Your account has been created. Use this code to verify your phone: :code',
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Limit SMS sending to prevent abuse
    |
    */
    'rate_limit' => [
        'enabled' => true,
        'max_per_hour' => 10, // Max SMS per phone number per hour
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging
    |--------------------------------------------------------------------------
    |
    | Log all SMS attempts for debugging and tracking
    |
    */
    'log' => env('SMS_LOG_ENABLED', true),
];
