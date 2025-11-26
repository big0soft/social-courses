<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Card Redeemed Successfully</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #4CAF50;
        }
        .header h1 {
            color: #4CAF50;
            margin: 0;
            font-size: 24px;
        }
        .success-icon {
            font-size: 48px;
            color: #4CAF50;
            margin-bottom: 10px;
        }
        .content {
            margin-bottom: 30px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            margin-bottom: 20px;
            color: #555;
        }
        .course-list {
            background-color: #f9f9f9;
            border-left: 4px solid #4CAF50;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .course-list h3 {
            margin-top: 0;
            color: #333;
            font-size: 18px;
        }
        .course-item {
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .course-item:last-child {
            border-bottom: none;
        }
        .course-name {
            font-weight: 600;
            color: #2196F3;
            font-size: 16px;
        }
        .card-type-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        .badge-single {
            background-color: #E3F2FD;
            color: #1976D2;
        }
        .badge-bundle {
            background-color: #F3E5F5;
            color: #7B1FA2;
        }
        .cta-button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #4CAF50;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .cta-button:hover {
            background-color: #45a049;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #888;
            font-size: 14px;
        }
        .summary {
            background-color: #E8F5E9;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
        }
        .summary-label {
            font-weight: 600;
            color: #555;
        }
        .summary-value {
            color: #4CAF50;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✓</div>
            <h1>Card Redeemed Successfully!</h1>
        </div>

        <div class="content">
            <p class="greeting">Hello {{ $user->name }},</p>

            <p class="message">
                Great news! Your prepaid card has been successfully redeemed. You now have instant access to
                {{ $coursesEnrolled }} {{ $coursesEnrolled === 1 ? 'course' : 'courses' }}.
            </p>

            <div class="summary">
                <div class="summary-item">
                    <span class="summary-label">Card Type:</span>
                    <span class="summary-value">{{ $cardType === 'single_course' ? 'Single Course' : 'Course Bundle' }}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Courses Enrolled:</span>
                    <span class="summary-value">{{ $coursesEnrolled }}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Access Type:</span>
                    <span class="summary-value">Lifetime Access</span>
                </div>
            </div>

            <div class="course-list">
                <h3>📚 Your New Courses:</h3>
                @foreach($courses as $course)
                    <div class="course-item">
                        <div class="course-name">{{ $course['title'] }}</div>
                    </div>
                @endforeach
            </div>

            <p class="message">
                You can start learning immediately! All courses are available in your dashboard with lifetime access.
            </p>

            <div style="text-align: center;">
                <a href="{{ config('app.url') }}/student/courses" class="cta-button">
                    Start Learning Now →
                </a>
            </div>

            <p class="message" style="margin-top: 30px; font-size: 14px; color: #666;">
                <strong>Need help?</strong><br>
                If you have any questions or need assistance accessing your courses,
                please contact our support team.
            </p>
        </div>

        <div class="footer">
            <p>
                This is an automated message confirming your prepaid card redemption.<br>
                © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </p>
            <p style="font-size: 12px; margin-top: 10px;">
                You're receiving this email because you redeemed a prepaid card on our platform.
            </p>
        </div>
    </div>
</body>
</html>
