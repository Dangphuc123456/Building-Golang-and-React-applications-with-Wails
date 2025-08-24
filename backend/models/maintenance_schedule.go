package models

type MaintenanceSchedule struct {
	ID              int             `gorm:"primaryKey;autoIncrement" json:"id"`
	EquipmentID     int             `json:"equipment_id"`
	ScheduledDate   string          `json:"scheduled_date"` // string ISO 8601
	Description     string          `json:"description"`
	Status          string          `gorm:"type:enum('pending','completed');default:'pending'" json:"status"`
	TechnicianID    *int            `json:"technician_id"`
	CreatedAt       string          `json:"created_at"`
	RepairHistories []RepairHistory `json:"repair_histories" gorm:"foreignKey:MaintenanceID"`
}
