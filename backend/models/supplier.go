package models

type Supplier struct {
    ID         int         `gorm:"primaryKey;autoIncrement" json:"id"`
    Name       string      `json:"name"`
    Phone      string      `json:"phone"`
    Email      string      `json:"email"`
    Address    string      `json:"address"`
    CreatedAt  string      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"` // để dạng string
    Equipments []Equipment `json:"equipments" gorm:"foreignKey:SupplierID"`
}
