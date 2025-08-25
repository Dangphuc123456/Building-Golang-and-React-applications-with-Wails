package models

type RepairHistory struct {
	ID            int     `gorm:"primaryKey;autoIncrement" json:"id"`
	RepairDate    string  `gorm:"column:repair_date;not null" json:"repair_date"`
	IssueDesc     string  `gorm:"column:issue_description" json:"issue_description"`
	Cost          float64 `gorm:"type:decimal(10,2)" json:"cost"`
	TechnicianID  *int    `gorm:"column:technician_id" json:"technician_id"`
	MaintenanceID *int    `gorm:"column:maintenance_id" json:"maintenance_id"`
	CreatedAt     string  `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
}
