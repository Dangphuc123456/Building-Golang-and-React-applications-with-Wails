// internal/services/maintenance_service.go
package services

import (
	"fmt"
	"Device-t/backend/models"
	"Device-t/backend/repositories"
	"net/smtp"
	"os"
)

type MaintenanceService struct {
	Repo *repositories.MaintenanceRepository
}

func NewMaintenanceService(repo *repositories.MaintenanceRepository) *MaintenanceService {
	return &MaintenanceService{Repo: repo}
}

func (s *MaintenanceService) GetAllMaintenances() ([]models.MaintenanceSchedule, error) {
	return s.Repo.GetAll()
}

func (s *MaintenanceService) CreateMaintenance(m *models.MaintenanceSchedule) error {
	err := s.Repo.Create(m)
	if err != nil {
		return err
	}

	// Lấy email kỹ thuật viên để gửi thông báo
	if m.TechnicianID != nil {
		var techEmail, techName string
		err := s.Repo.DB.QueryRow("SELECT username, email FROM users WHERE id = ?", m.TechnicianID).Scan(&techName, &techEmail)
		if err == nil && techEmail != "" {
			subject := "Thông báo phân công lịch bảo trì"
			
			// m.ScheduledDate là string, có thể dùng trực tiếp
			body := fmt.Sprintf(
				"📌 Xin chào %s,\n\n"+
					"Bạn vừa được phân công thực hiện lịch bảo trì cho thiết bị #%d\n"+
					"Ngày bảo trì: %s\nMô tả: %s\n\nVui lòng đăng nhập hệ thống để xác nhận.",
				techName, m.EquipmentID, m.ScheduledDate, m.Description,
			)
			go sendEmail(techEmail, subject, body)
		}
	}

	return nil
}


func (s *MaintenanceService) UpdateMaintenance(id int, m *models.MaintenanceSchedule) error {
	return s.Repo.Update(id, m)
}

func (s *MaintenanceService) DeleteMaintenance(id int) error {
	return s.Repo.Delete(id)
}

func (s *MaintenanceService) GetByID(id int) (*models.MaintenanceSchedule, error) {
    return s.Repo.GetByID(id)
}


// Hàm gửi email
func sendEmail(to string, subject string, body string) {
	from := os.Getenv("EMAIL_USER")
	pass := os.Getenv("EMAIL_PASS")

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	// HTML email
	htmlBody := fmt.Sprintf(`
		<!DOCTYPE html>
		<html lang="vi">
		<head>
			<meta charset="UTF-8">
			<title>%s</title>
		</head>
		<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
			<div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
				<h2 style="color: #1a73e8; text-align: center;">Thông báo lịch bảo trì</h2>
				<p style="font-size: 16px; color: #555;">Xin chào,</p>
				<p style="font-size: 16px; color: #555;">Bạn có lịch bảo trì sắp tới:</p>
				<div style="background-color: #e8f0fe; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
					<span style="font-size: 18px; font-weight: bold; color: #1a73e8;">%s</span>
				</div>
				<p style="font-size: 14px; color: #777;">Vui lòng thực hiện các bước chuẩn bị cần thiết cho việc bảo trì.</p>
				<p style="font-size: 12px; color: #aaa; margin-top: 30px;">Nếu bạn không nhận được thông báo này, hãy liên hệ với quản trị viên.</p>
			</div>
		</body>
		</html>
	`, subject, body)
	message := []byte(
		"To: " + to + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"MIME-version: 1.0;\n" +
			"Content-Type: text/html; charset=\"UTF-8\";\n\n" +
			htmlBody)

	auth := smtp.PlainAuth("", from, pass, smtpHost)
	if err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, message); err != nil {
		fmt.Println("❌ Lỗi gửi mail:", err)
	} else {
		fmt.Println("📩 Email đã gửi tới:", to)
	}
}
