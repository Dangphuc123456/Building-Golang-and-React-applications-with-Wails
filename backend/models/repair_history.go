package models

type RepairHistory struct {
	ID            int     `gorm:"primaryKey;autoIncrement" json:"id"`
	RepairDate    string  `json:"repair_date"`           // string ISO 8601
	IssueDesc     string  `json:"issue_description"`     // JSON name trùng frontend
	Cost          float64 `gorm:"type:decimal(10,2)" json:"cost"`
	TechnicianID  *int    `json:"technician_id"`
	MaintenanceID *int    `json:"maintenance_id"`
	CreatedAt     string  `json:"created_at"`
}
