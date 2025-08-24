package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

// DB là biến toàn cục để sử dụng trong toàn app
var DB *sql.DB

func ConnectDB() {
	// Load .env nếu có
	_ = godotenv.Load()

	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	name := os.Getenv("DB_NAME")

	if port == "" {
		port = "3306"
	}
	if host == "" {
		host = "127.0.0.1"
	}

	// DEBUG: in ra cấu hình (không in pass thực tế nếu production)
	log.Println("DEBUG DB config:", "user=", user, "host=", host, "port=", port, "name=", name)

	// Build DSN
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", user, pass, host, port, name)

	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Println("❌ Lỗi mở kết nối DB:", err)
		return
	}

	// Ping DB
	err = DB.Ping()
	if err != nil {
		log.Println("❌ Không thể kết nối tới MySQL:", err)
		return
	}

	// Thành công
	log.Println("✅ Kết nối MySQL thành công!")
}
