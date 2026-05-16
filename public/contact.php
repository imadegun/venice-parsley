<?php
/**
 * Contact Form Email Handler
 * Works on Aruba shared hosting with PHP
 * 
 * POST request with JSON body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "+1234567890",
 *   "subject": "Subject",
 *   "message": "Message text",
 *   "language": "en"
 * }
 */

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Set CORS headers for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Client-Info');
header('Content-Type: application/json');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Get JSON body
$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON body']);
    exit;
}

// Validate required fields
$name = isset($data['name']) ? trim($data['name']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$phone = isset($data['phone']) ? trim($data['phone']) : 'Not provided';
$subject = isset($data['subject']) ? trim($data['subject']) : '';
$message = isset($data['message']) ? trim($data['message']) : '';
$language = isset($data['language']) ? trim($data['language']) : 'en';

if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Name, email, and message are required']);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit;
}

// Email configuration
$fromEmail = 'info@veniceparsley.com';
$toEmail = 'info@veniceparsley.com';
$replyToEmail = 'marcello@veniceparsley.com';

// Build email subject
$emailSubject = !empty($subject) ? $subject : "Contact Form: {$name}";

// Build email body (HTML)
$emailBody = "
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; max-width: 600px; }
        td { padding: 8px; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; }
        .message { background: #f9f9f9; padding: 16px; border-radius: 8px; white-space: pre-wrap; margin-top: 16px; }
    </style>
</head>
<body>
    <h2>New Contact Form Submission</h2>
    <table>
        <tr>
            <td class='label'>Name:</td>
            <td>" . htmlspecialchars($name) . "</td>
        </tr>
        <tr>
            <td class='label'>Email:</td>
            <td>" . htmlspecialchars($email) . "</td>
        </tr>
        <tr>
            <td class='label'>Phone:</td>
            <td>" . htmlspecialchars($phone) . "</td>
        </tr>
        <tr>
            <td class='label'>Language:</td>
            <td>" . htmlspecialchars($language) . "</td>
        </tr>
    </table>
    
    <h3>Message:</h3>
    <div class='message'>" . htmlspecialchars($message) . "</div>
</body>
</html>
";

// Build plain text version for fallback
$textBody = "New Contact Form Submission\n\n";
$textBody .= "Name: {$name}\n";
$textBody .= "Email: {$email}\n";
$textBody .= "Phone: {$phone}\n";
$textBody .= "Language: {$language}\n\n";
$textBody .= "Message:\n{$message}\n";

// Set email headers
$headers = "From: {$fromEmail}\r\n";
$headers .= "Reply-To: {$replyToEmail}\r\n";
$headers .= "Return-Path: {$fromEmail}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

// Send email
$mailSent = mail($toEmail, $emailSubject, $emailBody, $headers);

if ($mailSent) {
    echo json_encode([
        'success' => true,
        'message' => 'Email sent successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to send email. Please check server mail configuration.'
    ]);
}
?>
