package models

type Equipment struct {
	ID         int                  `gorm:"primaryKey;autoIncrement" json:"id"`
	Name       string               `gorm:"size:100;not null" json:"name"`
	Category   string               `json:"category"`
	PurchaseDate string             `gorm:"column:purchase_date" json:"purchase_date"`
	Status     string               `gorm:"check:status IN ('active','inactive','maintenance');default:'active'" json:"status"`
	SupplierID *int                 `gorm:"column:supplier_id" json:"supplier_id,omitempty"`
	Price      float64              `gorm:"type:decimal(15,2);default:0.00" json:"price"`
	CreatedAt  string               `gorm:"column:created_at;default:CURRENT_TIMESTAMP" json:"created_at"`

	Schedules  []MaintenanceSchedule `json:"schedules" gorm:"foreignKey:EquipmentID"`
}
