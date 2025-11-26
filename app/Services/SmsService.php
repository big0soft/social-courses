<?php

namespace App\Services;

use App\Models\PrepaidCard;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SmsService
{
    private string $provider;
    private bool $enabled;

    public function __construct()
    {
        $this->provider = config('sms.provider', 'disabled');
        $this->enabled = config('sms.enabled', false) && $this->provider !== 'disabled';
    }

    /**
     * Check if SMS service is enabled and configured
     */
    public function isEnabled(): bool
    {
        if (!$this->enabled) {
            return false;
        }

        // Check if provider credentials are set
        if ($this->provider === 'twilio') {
            return !empty(config('sms.twilio.sid')) &&
                   !empty(config('sms.twilio.token')) &&
                   !empty(config('sms.twilio.from'));
        }

        if ($this->provider === 'nexmo') {
            return !empty(config('sms.nexmo.key')) &&
                   !empty(config('sms.nexmo.secret')) &&
                   !empty(config('sms.nexmo.from'));
        }

        return false;
    }

    /**
     * Send an SMS message
     */
    public function send(string $to, string $message): bool
    {
        if (!$this->isEnabled()) {
            Log::info('SMS service is disabled');
            return false;
        }

        // Check rate limiting
        if ($this->isRateLimited($to)) {
            Log::warning('SMS rate limit exceeded', ['phone' => $to]);
            return false;
        }

        try {
            $result = match ($this->provider) {
                'twilio' => $this->sendViaTwilio($to, $message),
                'nexmo' => $this->sendViaNexmo($to, $message),
                default => false,
            };

            if ($result) {
                $this->incrementRateLimit($to);
                $this->logSms($to, $message, 'sent');
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('SMS sending failed', [
                'phone' => $to,
                'error' => $e->getMessage(),
                'provider' => $this->provider,
            ]);
            $this->logSms($to, $message, 'failed', $e->getMessage());
            return false;
        }
    }

    /**
     * Send SMS via Twilio
     */
    private function sendViaTwilio(string $to, string $message): bool
    {
        if (!class_exists('\Twilio\Rest\Client')) {
            throw new \Exception('Twilio SDK not installed. Run: composer require twilio/sdk');
        }

        $sid = config('sms.twilio.sid');
        $token = config('sms.twilio.token');
        $from = config('sms.twilio.from');

        $client = new \Twilio\Rest\Client($sid, $token);

        $result = $client->messages->create($to, [
            'from' => $from,
            'body' => $message,
        ]);

        return $result->sid !== null;
    }

    /**
     * Send SMS via Nexmo/Vonage
     */
    private function sendViaNexmo(string $to, string $message): bool
    {
        $key = config('sms.nexmo.key');
        $secret = config('sms.nexmo.secret');
        $from = config('sms.nexmo.from');

        $url = 'https://rest.nexmo.com/sms/json';
        $data = [
            'api_key' => $key,
            'api_secret' => $secret,
            'from' => $from,
            'to' => $to,
            'text' => $message,
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode($response, true);

        return isset($result['messages'][0]['status']) && $result['messages'][0]['status'] === '0';
    }

    /**
     * Send card activation notification
     */
    public function sendCardActivationNotification(User $user, PrepaidCard $card): bool
    {
        if (!$user->phone) {
            return false;
        }

        $coursesCount = $card->card_type === \App\Enums\CardType::SINGLE_COURSE
            ? 1
            : $card->bundleCourses->count();

        $message = strtr(config('sms.templates.card_activation'), [
            ':code' => $card->code,
            ':courses_count' => $coursesCount,
            ':url' => url('/'),
        ]);

        return $this->send($user->phone, $message);
    }

    /**
     * Send payment confirmation notification
     */
    public function sendPaymentConfirmation(User $user, float $amount, string $currency = 'USD'): bool
    {
        if (!$user->phone) {
            return false;
        }

        $message = strtr(config('sms.templates.payment_confirmation'), [
            ':amount' => $amount,
            ':currency' => $currency,
        ]);

        return $this->send($user->phone, $message);
    }

    /**
     * Send account activation code
     */
    public function sendAccountActivationCode(User $user, string $code): bool
    {
        if (!$user->phone) {
            return false;
        }

        $message = strtr(config('sms.templates.account_activation'), [
            ':code' => $code,
        ]);

        return $this->send($user->phone, $message);
    }

    /**
     * Check if phone number is rate limited
     */
    private function isRateLimited(string $phone): bool
    {
        if (!config('sms.rate_limit.enabled')) {
            return false;
        }

        $key = 'sms_rate_limit:' . $phone;
        $maxPerHour = config('sms.rate_limit.max_per_hour', 10);

        $count = Cache::get($key, 0);

        return $count >= $maxPerHour;
    }

    /**
     * Increment rate limit counter
     */
    private function incrementRateLimit(string $phone): void
    {
        if (!config('sms.rate_limit.enabled')) {
            return;
        }

        $key = 'sms_rate_limit:' . $phone;
        $count = Cache::get($key, 0);
        Cache::put($key, $count + 1, now()->addHour());
    }

    /**
     * Log SMS attempt
     */
    private function logSms(string $to, string $message, string $status, ?string $error = null): void
    {
        if (!config('sms.log')) {
            return;
        }

        Log::info('SMS ' . $status, [
            'to' => substr($to, 0, 3) . '****' . substr($to, -2), // Mask phone for privacy
            'message_length' => strlen($message),
            'provider' => $this->provider,
            'error' => $error,
        ]);
    }
}
