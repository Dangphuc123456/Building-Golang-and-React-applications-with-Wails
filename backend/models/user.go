package models

type User struct {
    ID           int    `gorm:"primaryKey;autoIncrement" json:"id"`
    Username     string `gorm:"unique;size:191;not null" json:"username"`
    PasswordHash string `gorm:"not null" json:"password_hash"`
    Role         string `gorm:"type:text;check:role IN ('admin','technician','staff');default:'technician'" json:"role"`
    Email        string `json:"email"`
    Address      string `json:"address"`
    Phone        string `json:"phone"`
    CreatedAt    string `gorm:"type:varchar(50);default:CURRENT_TIMESTAMP" json:"created_at"`
    UpdatedAt    string `gorm:"type:varchar(50);default:CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP" json:"updated_at"`
}
