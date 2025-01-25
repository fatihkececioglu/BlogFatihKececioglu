<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

// Form verilerini al
$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$feedback = filter_input(INPUT_POST, 'feedback', FILTER_SANITIZE_STRING);

// PHPMailer ile mail gönderme
$mail = new PHPMailer(true);

try {
    // SMTP ayarları
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'fatih776692@gmail.com';
    $mail->Password = 'gtlz iddf vuif vbwu';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->CharSet = 'UTF-8';
    
    // Mail içeriği
    $mail->setFrom('fatih776692@gmail.com', 'Blog Sitesi İletişim Formu');
    $mail->addReplyTo($mail->Username, $name);
    $mail->addAddress('fatih776692@gmail.com', 'Fatih Keçecioğlu');
    $mail->Subject = 'Blog Sitesi - Yeni Görüş Bildirimi';
    
    $messageBody = "Yeni bir görüş gönderildi:\n\n";
    $messageBody .= "Gönderen: " . $name . "\n";
    $messageBody .= "Görüş:\n" . $feedback;
    
    $mail->Body = $messageBody;
    
    // Maili gönder
    $mail->send();
    
    // Başarılı gönderim
    echo '<!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Görüş Gönderildi</title>
        <link rel="stylesheet" href="style.css">
        <style>
            .message-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                text-align: center;
                padding: 2rem;
            }
            .success-message {
                background-color: var(--bg-secondary);
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                margin-bottom: 1rem;
            }
            .back-button {
                display: inline-block;
                background-color: var(--accent-color);
                color: white;
                padding: 0.8rem 2rem;
                border-radius: 25px;
                text-decoration: none;
                transition: all 0.3s ease;
            }
            .back-button:hover {
                opacity: 0.9;
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="message-container">
            <div class="success-message">
                <h2>Görüşünüz Gönderildi!</h2>
                <p>Değerli görüşlerinizi paylaştığınız için teşekkür ederim.</p>
            </div>
            <a href="index.html" class="back-button">Ana Sayfaya Dön</a>
        </div>
    </body>
    </html>';

} catch (Exception $e) {
    // Hata durumu
    echo '<!DOCTYPE html>
    <html lang="tr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hata</title>
        <link rel="stylesheet" href="style.css">
        <style>
            .message-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                text-align: center;
                padding: 2rem;
            }
            .error-message {
                background-color: var(--bg-secondary);
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                margin-bottom: 1rem;
                color: #ff4444;
            }
            .back-button {
                display: inline-block;
                background-color: var(--accent-color);
                color: white;
                padding: 0.8rem 2rem;
                border-radius: 25px;
                text-decoration: none;
                transition: all 0.3s ease;
            }
            .back-button:hover {
                opacity: 0.9;
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="message-container">
            <div class="error-message">
                <h2>Bir Hata Oluştu</h2>
                <p>Görüşünüz gönderilirken bir hata oluştu: ' . $mail->ErrorInfo . '</p>
            </div>
            <a href="index.html" class="back-button">Ana Sayfaya Dön</a>
        </div>
    </body>
    </html>';
}
?> 