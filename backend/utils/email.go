package utils

import (
	"fmt"
	"net/smtp"
	"os"
)

func SendOTP(to string, otp string) error {
	// Lấy thông tin từ env
	from := os.Getenv("EMAIL_USER")
	pass := os.Getenv("EMAIL_PASS")
	host := os.Getenv("EMAIL_HOST")
	port := os.Getenv("EMAIL_PORT")

	addr := fmt.Sprintf("%s:%s", host, port)

	// Nội dung email HTML
	htmlBody := fmt.Sprintf(`
		<!DOCTYPE html>
		<html lang="vi">
		<head>
		  <meta charset="UTF-8">
		  <title>Xác thực tài khoản</title>
		</head>
		<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
		  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
		    <h2 style="color: #333;">Xin chào!</h2>
		    <p style="font-size: 16px; color: #555;">Mã OTP của bạn là:</p>
		    <p style="font-size: 36px; font-weight: bold; color: #1a73e8; letter-spacing: 5px; margin: 20px 0;">%s</p>
		    <p style="font-size: 14px; color: #888;">Vui lòng nhập mã này để xác thực tài khoản của bạn.</p>
		    <p style="font-size: 12px; color: #aaa; margin-top: 30px;">Nếu bạn không yêu cầu OTP này, hãy bỏ qua email này.</p>
		  </div>
		</body>
		</html>
	`, otp)

	// Tiêu đề email kèm nội dung HTML
	msg := []byte(
		"Subject: Xác thực tài khoản\n" +
			"MIME-version: 1.0;\n" +
			"Content-Type: text/html; charset=\"UTF-8\";\n\n" +
			htmlBody)

	auth := smtp.PlainAuth("", from, pass, host)
	err := smtp.SendMail(addr, auth, from, []string{to}, msg)
	if err != nil {
		return err
	}

	return nil
}
