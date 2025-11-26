<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $purchase->invoice_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 14px;
            color: #333;
            line-height: 1.6;
            padding: 40px;
        }

        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }

        .invoice-header {
            display: table;
            width: 100%;
            margin-bottom: 40px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
        }

        .company-info {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .company-info h1 {
            font-size: 32px;
            color: #3b82f6;
            margin-bottom: 5px;
        }

        .company-info p {
            color: #666;
            font-size: 12px;
        }

        .invoice-meta {
            display: table-cell;
            width: 50%;
            text-align: right;
            vertical-align: top;
        }

        .invoice-meta h2 {
            font-size: 28px;
            color: #333;
            margin-bottom: 10px;
        }

        .invoice-meta .invoice-number {
            font-size: 18px;
            color: #3b82f6;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .invoice-details {
            display: table;
            width: 100%;
            margin-bottom: 40px;
        }

        .invoice-details > div {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 10px;
            letter-spacing: 0.5px;
        }

        .detail-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-right: 20px;
        }

        .detail-box p {
            margin-bottom: 5px;
        }

        .detail-box strong {
            display: inline-block;
            width: 120px;
            color: #666;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .items-table thead {
            background: #3b82f6;
            color: white;
        }

        .items-table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .items-table th:last-child,
        .items-table td:last-child {
            text-align: right;
        }

        .items-table tbody tr {
            border-bottom: 1px solid #e5e7eb;
        }

        .items-table tbody tr:hover {
            background: #f9fafb;
        }

        .items-table td {
            padding: 12px;
        }

        .summary-section {
            display: table;
            width: 100%;
            margin-bottom: 40px;
        }

        .summary-left {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .summary-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }

        .summary-table {
            width: 100%;
            margin-left: auto;
        }

        .summary-table tr {
            border-bottom: 1px solid #e5e7eb;
        }

        .summary-table td {
            padding: 10px 0;
        }

        .summary-table td:first-child {
            color: #666;
            font-weight: 500;
        }

        .summary-table td:last-child {
            text-align: right;
            font-weight: 600;
        }

        .summary-table .discount-row td {
            color: #10b981;
        }

        .summary-table .total-row {
            border-top: 2px solid #333;
            font-size: 18px;
        }

        .summary-table .total-row td {
            padding-top: 15px;
            color: #333;
        }

        .payment-status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-paid {
            background: #d1fae5;
            color: #065f46;
        }

        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }

        .status-partial {
            background: #dbeafe;
            color: #1e40af;
        }

        .status-refunded {
            background: #fee2e2;
            color: #991b1b;
        }

        .notes-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
        }

        .notes-section h3 {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }

        .notes-section p {
            color: #333;
            line-height: 1.8;
        }

        .footer {
            text-align: center;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            color: #666;
            font-size: 12px;
        }

        .footer p {
            margin-bottom: 5px;
        }

        .highlight-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
        }

        .highlight-box strong {
            color: #1e40af;
        }

        @media print {
            body {
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
            <div class="company-info">
                <h1>{{ config('app.name', 'Beta E-Learning') }}</h1>
                <p>Online Learning Platform</p>
                <p>Email: {{ config('mail.from.address') }}</p>
                @if(isset($systemSettings))
                    <p>Phone: {{ $systemSettings->phone ?? '' }}</p>
                    <p>{{ $systemSettings->address ?? '' }}</p>
                @endif
            </div>
            <div class="invoice-meta">
                <h2>INVOICE</h2>
                <div class="invoice-number">{{ $purchase->invoice_number }}</div>
                <p><strong>Date:</strong> {{ $purchase->created_at->format('M d, Y') }}</p>
                @if($purchase->payment_date)
                    <p><strong>Payment Date:</strong> {{ \Carbon\Carbon::parse($purchase->payment_date)->format('M d, Y') }}</p>
                @endif
            </div>
        </div>

        <!-- Invoice Details -->
        <div class="invoice-details">
            <div>
                <div class="section-title">Bill To</div>
                <div class="detail-box">
                    <p><strong>{{ $purchase->salesPoint->name }}</strong></p>
                    <p>{{ $purchase->salesPoint->address }}</p>
                    <p><strong>Phone:</strong> {{ $purchase->salesPoint->phone }}</p>
                    <p><strong>Email:</strong> {{ $purchase->salesPoint->email }}</p>
                </div>
            </div>
            <div>
                <div class="section-title">Payment Information</div>
                <div class="detail-box" style="margin-right: 0;">
                    <p><strong>Status:</strong>
                        <span class="payment-status status-{{ $purchase->payment_status }}">
                            {{ strtoupper($purchase->payment_status) }}
                        </span>
                    </p>
                    @if($purchase->payment_method)
                        <p><strong>Method:</strong> {{ ucwords(str_replace('_', ' ', $purchase->payment_method)) }}</p>
                    @endif
                    <p><strong>Processed By:</strong> {{ $purchase->admin->name }}</p>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: center;">Unit Price</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>Prepaid Course Access Cards</strong><br>
                        <small style="color: #666;">
                            {{ $purchase->cards->count() }} digital access cards for course redemption
                        </small>
                    </td>
                    <td style="text-align: center;">{{ $purchase->total_cards }}</td>
                    <td style="text-align: center;">
                        {{ number_format($purchase->total_amount / $purchase->total_cards, 2) }} {{ $purchase->currency ?? 'USD' }}
                    </td>
                    <td>{{ number_format($purchase->total_amount, 2) }} {{ $purchase->currency ?? 'USD' }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Summary -->
        <div class="summary-section">
            <div class="summary-left">
                <div class="highlight-box">
                    <strong>Total Cards Included:</strong> {{ $purchase->total_cards }}<br>
                    <strong>Cards Status:</strong><br>
                    <small>
                        • Active: {{ $purchase->activeCards->count() }}<br>
                        • Redeemed: {{ $purchase->redeemedCards->count() }}<br>
                        • Redemption Rate: {{ $purchase->total_cards > 0 ? number_format(($purchase->redeemedCards->count() / $purchase->total_cards) * 100, 1) : 0 }}%
                    </small>
                </div>
            </div>
            <div class="summary-right">
                <table class="summary-table">
                    <tr>
                        <td>Subtotal</td>
                        <td>{{ number_format($purchase->total_amount, 2) }} {{ $purchase->currency ?? 'USD' }}</td>
                    </tr>
                    @if(isset($pricing) && $pricing['discount_percent'] > 0)
                    <tr class="discount-row">
                        <td>Volume Discount ({{ $pricing['discount_percent'] }}%)</td>
                        <td>-{{ number_format($pricing['discount_amount'], 2) }} {{ $purchase->currency ?? 'USD' }}</td>
                    </tr>
                    @endif
                    <tr class="total-row">
                        <td>Total Amount</td>
                        <td>{{ number_format($purchase->total_amount, 2) }} {{ $purchase->currency ?? 'USD' }}</td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Notes -->
        @if($purchase->notes)
        <div class="notes-section">
            <h3>Additional Notes</h3>
            <p>{{ $purchase->notes }}</p>
        </div>
        @endif

        <!-- Card List Summary -->
        <div class="section-title" style="margin-top: 30px;">Card Inventory Summary</div>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 30px;">
            <p style="margin-bottom: 10px;"><strong>This purchase includes {{ $purchase->cards->count() }} prepaid access cards.</strong></p>
            <p style="font-size: 12px; color: #666;">
                Card codes are confidential and should be securely distributed to end customers.
                Each card can be redeemed once for course access on the platform.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p>For questions about this invoice, please contact {{ config('mail.from.address') }}</p>
            <p style="margin-top: 10px; color: #999;">
                Generated on {{ now()->format('M d, Y \a\t H:i:s') }}
            </p>
        </div>
    </div>
</body>
</html>
