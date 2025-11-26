<?php

namespace App\Http\Middleware;

use App\Services\SettingsService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SmtpConfigCheck
{
    public function __construct(private SettingsService $settingsService) {}

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->environment('local')) {
            return $next($request);
        }

        // Check SMTP configuration from config
        if (config('mail.default') === 'smtp') {
            $host = (string) config('mail.mailers.smtp.host');
            $port = (int) config('mail.mailers.smtp.port');
            $from = (string) config('mail.from.address');

            $h = strtolower(trim($host));
            if (str_contains($h, '://')) {
                $parts = parse_url($h);
                $h = isset($parts['host']) ? $parts['host'] : $h;
            }
            if (str_contains($h, ':')) {
                $h = explode(':', $h)[0];
            }

            $isLocal = in_array($h, ['127.0.0.1', 'localhost', '::1', '0.0.0.0']) || $port === 1025;
            if ($isLocal) {
                return $next($request);
            }

            if (empty($h) || empty($port) || empty($from)) {
                return back()->with('error', 'SMTP configuration is incomplete. Email sending feature is not work right now.');
            }

            if (empty(config('mail.mailers.smtp.username')) || empty(config('mail.mailers.smtp.password'))) {
                return back()->with('error', 'SMTP configuration is incomplete. Email sending feature is not work right now.');
            }
        } else {
            return back()->with('error', 'SMTP is not set as the mailer. Please check your configuration.');
        }

        return $next($request);
    }
}
