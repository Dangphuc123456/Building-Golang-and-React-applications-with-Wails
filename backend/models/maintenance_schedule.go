package models

type MaintenanceSchedule struct {
	ID              int             `gorm:"primaryKey;autoIncrement" json:"id"`
	EquipmentID     int             `gorm:"column:equipment_id;not null" json:"equipment_id"`
	ScheduledDate   string          `gorm:"column:scheduled_date;not null" json:"scheduled_date"`
	Description     string          `json:"description"`
	Status          string          `gorm:"check:status IN ('pending','completed');default:'pending'" json:"status"`
	TechnicianID    *int            `gorm:"column:technician_id" json:"technician_id"`
	CreatedAt       string          `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`
	RepairHistories []RepairHistory `json:"repair_histories" gorm:"foreignKey:MaintenanceID"`
}
