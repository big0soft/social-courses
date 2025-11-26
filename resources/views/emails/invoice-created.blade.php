<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $purchase->invoice_number }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                                {{ config('app.name', 'Beta E-Learning') }}
                            </h1>
                            <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 16px;">
                                Invoice Confirmation
                            </p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; font-size: 16px; color: #374151; line-height: 1.6;">
                                Dear <strong>{{ $purchase->salesPoint->name }}</strong>,
                            </p>

                            <p style="margin: 0 0 20px; font-size: 16px; color: #374151; line-height: 1.6;">
                                Thank you for your purchase! We're pleased to confirm your order and provide you with the invoice details.
                            </p>

                            <!-- Invoice Details Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin: 30px 0;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="font-size: 14px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                    Invoice Number
                                                </td>
                                                <td align="right" style="font-size: 18px; color: #3b82f6; font-weight: bold;">
                                                    {{ $purchase->invoice_number }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 14px; color: #6b7280; padding-top: 8px;">
                                                    Invoice Date
                                                </td>
                                                <td align="right" style="font-size: 14px; color: #111827; padding-top: 8px;">
                                                    {{ $purchase->created_at->format('F d, Y') }}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-size: 14px; color: #6b7280; padding-top: 8px;">
                                                    Total Cards
                                                </td>
                                                <td align="right" style="font-size: 14px; color: #111827; padding-top: 8px;">
                                                    {{ $purchase->total_cards }}
                                                </td>
                                            </tr>
                                            <tr style="border-top: 2px solid #e5e7eb;">
                                                <td style="font-size: 16px; color: #111827; font-weight: bold; padding-top: 15px;">
                                                    Total Amount
                                                </td>
                                                <td align="right" style="font-size: 20px; color: #10b981; font-weight: bold; padding-top: 15px;">
                                                    {{ number_format($purchase->total_amount, 2) }} {{ $purchase->currency ?? 'USD' }}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Payment Status -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                                            Payment Status:
                                        </p>
                                        @php
                                            $statusColors = [
                                                'paid' => ['bg' => '#d1fae5', 'text' => '#065f46'],
                                                'pending' => ['bg' => '#fef3c7', 'text' => '#92400e'],
                                                'partial' => ['bg' => '#dbeafe', 'text' => '#1e40af'],
                                                'refunded' => ['bg' => '#fee2e2', 'text' => '#991b1b'],
                                            ];
                                            $color = $statusColors[$purchase->payment_status] ?? ['bg' => '#f3f4f6', 'text' => '#374151'];
                                        @endphp
                                        <span style="display: inline-block; padding: 8px 16px; background-color: {{ $color['bg'] }}; color: {{ $color['text'] }}; font-size: 12px; font-weight: bold; text-transform: uppercase; border-radius: 4px; letter-spacing: 0.5px;">
                                            {{ strtoupper($purchase->payment_status) }}
                                        </span>
                                        @if($purchase->payment_method)
                                            <span style="margin-left: 10px; font-size: 14px; color: #6b7280;">
                                                via {{ ucwords(str_replace('_', ' ', $purchase->payment_method)) }}
                                            </span>
                                        @endif
                                    </td>
                                </tr>
                            </table>

                            <!-- Attachment Notice -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-left: 4px solid #3b82f6; margin: 25px 0;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px; font-size: 14px; color: #1e40af; font-weight: bold;">
                                            📎 Invoice Attachment
                                        </p>
                                        <p style="margin: 0; font-size: 14px; color: #1e40af; line-height: 1.6;">
                                            Your detailed invoice is attached to this email as a PDF document. Please save it for your records.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Card Access Instructions -->
                            <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <p style="margin: 0 0 10px; font-size: 14px; color: #92400e; font-weight: bold;">
                                    ⚠️ Important: Card Access Information
                                </p>
                                <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">
                                    Your {{ $purchase->total_cards }} prepaid access cards are now available in your account.
                                    Log in to your dashboard to view and manage your card inventory.
                                    <strong>Please keep card codes secure and distribute them only to authorized customers.</strong>
                                </p>
                            </div>

                            <!-- Next Steps -->
                            <div style="margin: 30px 0;">
                                <p style="margin: 0 0 15px; font-size: 16px; color: #111827; font-weight: bold;">
                                    What's Next?
                                </p>
                                <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.8;">
                                    <li>Access your cards from the sales point dashboard</li>
                                    <li>Distribute cards to your customers</li>
                                    <li>Track redemption rates and performance</li>
                                    <li>Contact support if you need any assistance</li>
                                </ul>
                            </div>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 35px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ config('app.url') }}/dashboard"
                                           style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                            View Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Support -->
                            <p style="margin: 30px 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                If you have any questions about this invoice or need assistance, please don't hesitate to contact our support team at
                                <a href="mailto:{{ config('mail.from.address') }}" style="color: #3b82f6; text-decoration: none;">
                                    {{ config('mail.from.address') }}
                                </a>
                            </p>

                            <p style="margin: 20px 0 0; font-size: 16px; color: #374151;">
                                Best regards,<br>
                                <strong>{{ config('app.name') }} Team</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px 40px; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px; font-size: 12px; color: #9ca3af;">
                                This is an automated message from {{ config('app.name') }}
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                            </p>
                            <p style="margin: 10px 0 0; font-size: 12px; color: #9ca3af;">
                                <a href="{{ config('app.url') }}" style="color: #3b82f6; text-decoration: none;">Visit Website</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
