package config

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func ConnectDB() {
	dbName := "equipment_maintenance.db"

	_, err := os.Stat(dbName)
	isNew := errors.Is(err, os.ErrNotExist)

	DB, err = sql.Open("sqlite3", fmt.Sprintf("./%s", dbName))
	if err != nil {
		log.Fatal("❌ Lỗi mở DB:", err)
	}

	_, _ = DB.Exec("PRAGMA foreign_keys = ON;")

	if err = DB.Ping(); err != nil {
		log.Fatal("❌ Không thể kết nối DB:", err)
	}

	if isNew {
		log.Println("⚡ Tạo DB mới và seed dữ liệu mẫu...")
		if err := initSchemaAndSeed(DB); err != nil {
			log.Fatal("❌ Lỗi seed DB:", err)
		}
	} else {
		log.Println("✅ DB đã tồn tại, kết nối thành công.")
	}
}

func initSchemaAndSeed(db *sql.DB) error {
	schemaAndSeed := `
PRAGMA foreign_keys = ON;

-- Bảng suppliers
CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO suppliers VALUES
(1,'Công Ty TNHH Sản Xuất Và Dịch Vụ Bảo Phúc (KING CITY)','02899887766','dangphucvghy195@gmail.com','Khu công nghiệp Cát Lái, TP.HCM','2025-08-24 12:52:12'),
(2,'Foenix Engineering Việt Nam','02498765432','foenixengineeringvn@gmail.com','Số 7 Ngõ 6, Đường Hùng Vương, Phường Tích Yên, TP. Vĩnh Yên, Vĩnh Phúc','2025-08-24 12:52:52'),
(3,'Công Ty TNHH Sản Xuất Thương Mại Kiến An','028 3758 2840','inoxkienan.vn@gmail.com','C7/20 Phạm Hùng, ấp 4, Xã Bình Hưng, Huyện Bình Chánh, TP. Hồ Chí Minh','2025-08-24 12:53:36'),
(4,'Công Ty TNHH TM Sản Xuất - Kỹ Thuật Trường An','0917 739 397','trungan@trungan.com.vn','Số 63/37/1 Đường 8, Phường Linh Xuân, Quận Thủ Đức, TP. Hồ Chí Minh','2025-08-24 12:54:18'),
(5,'Công Ty TNHH Galaxy Thiên Hà Xanh','02899887766','galaxy@thienhaxanh.com','TP. Hồ Chí Minh','2025-08-24 12:54:51'),
(6,'Công Ty TNHH Điện Máy Đại Việt','02433445566','dienmaydaiviet@gmail.com','TP. Hồ Chí Minh','2025-08-24 12:55:23'),
(7,'Công Ty TNHH Tự Động Hóa Vân Đình','0379 155 567','jerryhoang8691@gmail.com','2B14 Trần Văn Giàu, Lê Minh Xuân, Bình Chánh, TP. Hồ Chí Minh','2025-08-24 12:56:12'),
(8,'Công Ty TNHH XNK Thiết Bị Bếp Công Nghiệp Toàn Cầu','0979.184.888','sales@berjayavietnam.com','Hà Nội: 447 Phúc Diễn, P. Xuân Phương, TP. Hà Nội','2025-08-24 12:57:15'),
(9,'Công Ty Cổ Phần Sản Xuất Thương Mại Xây Dựng Hoàn Cầu','028 3923 0062','hoancau@gmail.com','Số 1001 Trần Hưng Đạo, Phường 5, Quận 5, TP. Hồ Chí Minh','2025-08-24 12:58:16'),
(10,'Công Ty Cổ Phần Vũ Gia Hà Nội','0889 968 688','noinauphofuji@gmail.com','78/245 Định Công, Quận Hoàng Mai, TP. Hà Nội','2025-08-24 12:59:12'),
(11,'Công Ty TNHH Thiết Bị và Công Nghệ Bằng Việt','0977 366 858','info@thietbibangviet.com','903 Tam Trinh, Yên Sở, Hoàng Mai, Hà Nội','2025-08-24 13:00:58');

-- Bảng users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password_hash TEXT,
  role TEXT CHECK(role IN ('admin','technician','staff')) DEFAULT 'technician',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email TEXT,
  address TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  phone TEXT
);

INSERT INTO users VALUES
(1,'Văn Phúc','$2a$10$oYN/q7lTczVKc2jgDN35BOOblv1kjiv7SXZGpEjvmB.kFEIekhDmy','admin','2025-08-17 23:41:54','dangphucvghy1953@gmail.com','Đại Kim,Hoàng Mai,Hà Nội','2025-08-24 11:39:07','0964505838'),
(2,'Nguyễn Nhật','$2a$10$usFuhtPXf.6EiKler6D1p.tWIayl05PFuKPnKifuO1qI3.iTDA5fa','technician','2025-08-17 23:43:35','pvan585923@gmail.com','Khu công nghiệp Cát Lái, TP.HCM','2025-08-17 23:46:52','0987543322'),
(3,'Hán Hoàng','$2a$10$/9A/N4LKrWkRuazrJ/EADOaTjPCGSmGbYZ5anu/sZw8ovWN15u27e','technician','2025-08-17 23:46:20','pvan58592@gmail.com','Khu công nghiệp Cát Lái, TP.HCM','2025-08-20 09:22:55','0987543323'),
(4,'Cao Hoàng','$2a$10$1msDUYuR109FnAkRDD68WeYAS24CE8SDgilGxZwUc96u707YVAAti','staff','2025-08-18 11:07:47','pvan585922@gmail.com','Khu công nghiệp Cát Lái, TP.HCM','2025-08-24 11:37:40','0985289442'),
(5,'Nguyễn Thành','$2a$10$n2xpnpZJd3y9zTmxzZ53UeI/Was/5HTAoeP/CKaPV/Rg/01TtupC6','technician','2025-08-18 11:13:21','pvan585921@gmail.com','Khu công nghiệp Cát Lái, TP.HCM','2025-08-23 03:15:10','0901234567'),
(6,'Thành Công','$2a$10$wh5JN9D1XvW1WCvdz6lKH.XQIDc.uSKNstLgmvOXhrzaa9eCqYAKK','staff','2025-08-21 16:32:52','dangphucvghy1952@gmail.com','Khu công nghiệp Cát Lái, TP.HCM','2025-08-24 11:38:05','1234567890'),
(8,'Huấn Cao','$2a$10$c/uHJiF/2Z8xI13RXsrWqu7wkgc94cF7vYhL8kK.vBW8RPj1IgnAi','staff','2025-08-24 09:17:50','dangphucvghy1958@gmail.com','Liên Chiểu,Liên Phương,TP.Hưng Yên','2025-08-24 11:39:42','02899887766'),
(9,'Đoàn Đào','$2a$10$YZ7RHX7GDRXVwZmb5QZCzuNM8uZ6aRh0WNh5/ownsx6zcXKrO6o.K','technician','2025-08-24 20:47:23','dangphucvghy195@gmail.com','Khu công nghiệp Cát Lái, TP.HCM','2025-08-24 20:47:23','02899887766');
-- Bảng equipments
CREATE TABLE equipments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  purchase_date DATE,
  status TEXT CHECK(status IN ('active','inactive','maintenance')) DEFAULT 'active',
  supplier_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  price DECIMAL(15,2) DEFAULT 0.00,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

INSERT INTO equipments VALUES 
(1,'Máy Làm Bánh Bao Công Nghiệp (VT-MLBTD10)',NULL,'2025-08-24','active',11,'2025-08-24 06:07:34',68000000.00),
(2,'Lò nướng đối lưu công nghiệp 5 khay',NULL,'2025-08-24','active',8,'2025-08-24 06:37:07',25000000.00),
(3,'Lò nướng bánh mì tầng',NULL,'2025-08-25','active',8,'2025-08-24 06:37:54',35000000.00),
(4,'Máy trộn bột đứng 20kg',NULL,'2025-08-26','active',1,'2025-08-24 06:38:40',18000000.00),
(5,'Máy trộn bột nghiêng 50kg',NULL,'2025-08-26','active',1,'2025-08-24 06:39:11',45000000.00),
(6,'Máy cán bột 500mm',NULL,'2025-08-28','maintenance',4,'2025-08-24 06:39:55',22000000.00),
(7,'Máy cán bột 700mm',NULL,'2025-08-28','active',4,'2025-08-24 06:40:45',30000000.00),
(8,'Máy chia bột 50g-200g',NULL,'2025-08-29','active',7,'2025-08-24 06:43:01',28000000.00),
(9,'Máy chia bột tự động',NULL,'2025-08-29','active',7,'2025-08-24 06:43:35',50000000.00),
(10,'Máy se bột bánh mì',NULL,'2025-08-30','active',10,'2025-08-24 06:44:36',20000000.00),
(11,'Máy se bột đa năng',NULL,'2025-08-30','active',10,'2025-08-24 06:44:55',40000000.00),
(12,'Tủ ủ bột 12 khay',NULL,'2025-09-01','active',6,'2025-08-24 06:45:50',15000000.00),
(13,'Tủ ủ bột 24 khay',NULL,'2025-09-01','active',6,'2025-08-24 06:46:08',28000000.00),
(14,'Máy cắt lát bánh mì',NULL,'2025-09-02','active',3,'2025-08-24 06:47:06',12000000.00),
(15,'Máy cắt bánh ngọt',NULL,'2025-09-02','active',3,'2025-08-24 06:47:26',18000000.00),
(16,'Dây chuyền làm bánh mì mini',NULL,'2025-09-05','active',2,'2025-08-24 06:49:02',80000000.00),
(17,'Dây chuyền làm bánh mì tự động',NULL,'2025-09-05','active',2,'2025-08-24 06:49:28',100000000.00),
(18,'Máy hút chân không đóng gói bánh',NULL,'2025-09-06','active',5,'2025-08-24 06:52:55',35000000.00),
(19,'Máy đóng gói bánh ngọt',NULL,'2025-09-06','active',5,'2025-08-24 06:53:19',48000000.00),
(20,'Máy phun nước/nhúng bánh',NULL,'2025-09-14','active',9,'2025-08-24 06:54:25',14000000.00),
(21,'Máy tạo hình bánh',NULL,'2025-09-14','active',9,'2025-08-24 06:55:07',48000000.00),
(22,'Máy sấy bánh ngọt',NULL,'2025-09-16','active',11,'2025-08-24 06:56:18',28000000.00),
(23,'Máy tạo vỏ bánh',NULL,'2025-08-24','maintenance',4,'2025-08-24 10:50:00',20000000.00);
-- Bảng maintenance_schedules
CREATE TABLE maintenance_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  equipment_id INTEGER NOT NULL,
  scheduled_date DATE NOT NULL,
  description TEXT,
  status TEXT CHECK(status IN ('pending','completed')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  technician_id INTEGER,
  FOREIGN KEY (equipment_id) REFERENCES equipments(id) ON DELETE CASCADE,
  FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO maintenance_schedules VALUES
(1,1,'2025-08-24','Bảo trì định kỳ sau 3 tháng sử dụng','completed','2025-08-24 08:06:24',3),
(2,20,'2025-08-24','Bảo dưỡng kiểm tra định kì tháng 8','completed','2025-08-24 08:12:20',3),
(3,23,'2025-08-24','Kiểm tra định kì máy sau 3 tháng ','pending','2025-08-24 10:50:36',3),
(4,6,'2025-08-26','Kiểm tra định kỳ máy cán bột quý 3','pending','2025-08-24 13:22:09',3);

-- Bảng repair_history
CREATE TABLE repair_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repair_date DATE NOT NULL,
  issue_description TEXT,
  cost DECIMAL(10,2),
  technician_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  maintenance_id INTEGER,
  FOREIGN KEY (maintenance_id) REFERENCES maintenance_schedules(id),
  FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO repair_history VALUES
(1,'2025-08-25','Thay đầu phun',2300000.00,3,'2025-08-24 08:27:29',1),
(2,'2025-08-25','Máy chạy ổn định không có lỗi',0.00,3,'2025-08-24 08:33:49',1);
`
	_, err := db.Exec(schemaAndSeed)
	return err
}
