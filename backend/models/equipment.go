package models



type Equipment struct {
    ID           int       `gorm:"primaryKey;autoIncrement" json:"id"`
    Name         string    `gorm:"size:100;not null" json:"name"`
    PurchaseDate string    `json:"purchase_date"` // đã đổi
    Status       string    `gorm:"type:enum('active','inactive','maintenance');default:'active'" json:"status"`
    SupplierID   *int      `json:"supplier_id,omitempty"`
    Price        float64   `gorm:"type:decimal(15,2);default:0.00" json:"price"`
    CreatedAt    string    `json:"created_at"` // đã đổi
    Schedules    []MaintenanceSchedule `json:"schedules" gorm:"foreignKey:EquipmentID"`
}
