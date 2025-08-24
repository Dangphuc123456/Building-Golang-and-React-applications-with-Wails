package models

type User struct {
    ID           int    `gorm:"primaryKey;autoIncrement" json:"id"`
    Username     string `gorm:"unique;size:191" json:"username"`
    PasswordHash string `json:"password_hash"`
    Role         string `gorm:"type:enum('admin','technician','staff');default:'technician'" json:"role"`
    Email        string `json:"email"`
    Address      string  `json:"address"`
    Phone        string `json:"phone"`
    CreatedAt    string `json:"created_at"` 
    UpdatedAt    string `json:"updated_at"` 
}