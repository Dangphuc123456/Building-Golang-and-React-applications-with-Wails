package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
	"github.com/joho/godotenv"
)

var DB *sql.DB

func ConnectDB() {
	_ = godotenv.Load()

	driver := os.Getenv("DB_DRIVER")
	dbName := os.Getenv("DB_NAME")

	if driver == "" {
		driver = "sqlite"
	}
	if dbName == "" {
		dbName = "equipment_maintenance.db"
	}

	log.Println("DEBUG DB config:", "driver=", driver, "name=", dbName)

	var err error
	DB, err = sql.Open("sqlite3", fmt.Sprintf("./%s", dbName))
	if err != nil {
		log.Println("❌ Lỗi mở kết nối DB:", err)
		return
	}

	// Bật foreign keys
	_, _ = DB.Exec("PRAGMA foreign_keys = ON;")

	if err = DB.Ping(); err != nil {
		log.Println("❌ Không thể kết nối SQLite:", err)
		return
	}

	log.Println("✅ Kết nối SQLite thành công!")
}
