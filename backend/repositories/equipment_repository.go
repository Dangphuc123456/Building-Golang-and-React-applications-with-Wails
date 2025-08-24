package repositories

import (
	"database/sql"
	"Device-t/backend/models"
	"time"
)

type EquipmentRepository struct {
	DB *sql.DB
}

func NewEquipmentRepository(db *sql.DB) *EquipmentRepository {
	return &EquipmentRepository{DB: db}
}

func (r *EquipmentRepository) GetAll() ([]models.Equipment, error) {
	rows, err := r.DB.Query("SELECT id, name, price, purchase_date, status, supplier_id, created_at FROM equipments")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var equipments []models.Equipment
	for rows.Next() {
		var eq models.Equipment
		var purchaseDate sql.NullTime
		var supplierID sql.NullInt64
		var createdAt sql.NullTime

		if err := rows.Scan(&eq.ID, &eq.Name, &eq.Price, &purchaseDate, &eq.Status, &supplierID, &createdAt); err != nil {
			return nil, err
		}

		if purchaseDate.Valid {
			eq.PurchaseDate = purchaseDate.Time.Format("2006-01-02 15:04:05")
		}
		if supplierID.Valid {
			id := int(supplierID.Int64)
			eq.SupplierID = &id
		}
		if createdAt.Valid {
			eq.CreatedAt = createdAt.Time.Format("2006-01-02 15:04:05")
		}

		equipments = append(equipments, eq)
	}
	return equipments, nil
}

func (r *EquipmentRepository) Create(eq *models.Equipment) error {
	var supplierID interface{}
	if eq.SupplierID != nil {
		supplierID = *eq.SupplierID
	}

	now := time.Now().Format("2006-01-02 15:04:05")
	res, err := r.DB.Exec(
		"INSERT INTO equipments (name, price, purchase_date, status, supplier_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
		eq.Name, eq.Price, eq.PurchaseDate, eq.Status, supplierID, now,
	)
	if err != nil {
		return err
	}

	lastID, _ := res.LastInsertId()
	eq.ID = int(lastID)
	eq.CreatedAt = now
	return nil
}

func (r *EquipmentRepository) Update(id int, eq *models.Equipment) error {
	var supplierID interface{}
	if eq.SupplierID != nil {
		supplierID = *eq.SupplierID
	}
	_, err := r.DB.Exec(
		"UPDATE equipments SET name=?, price=?, purchase_date=?, status=?, supplier_id=? WHERE id=?",
		eq.Name, eq.Price, eq.PurchaseDate, eq.Status, supplierID, id,
	)
	return err
}

func (r *EquipmentRepository) Delete(id int) error {
	_, err := r.DB.Exec(`
		DELETE rh FROM repair_history rh
		JOIN maintenance_schedules ms ON rh.maintenance_id = ms.id
		WHERE ms.equipment_id = ?`, id)
	if err != nil {
		return err
	}

	_, err = r.DB.Exec("DELETE FROM maintenance_schedules WHERE equipment_id=?", id)
	if err != nil {
		return err
	}

	_, err = r.DB.Exec("DELETE FROM equipments WHERE id=?", id)
	return err
}

func (r *EquipmentRepository) GetStats() (map[string]int, error) {
	rows, err := r.DB.Query("SELECT status, COUNT(*) FROM equipments GROUP BY status")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	stats := make(map[string]int)
	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err != nil {
			return nil, err
		}
		stats[status] = count
	}
	return stats, nil
}

func (r *EquipmentRepository) GetByID(id int) (*models.Equipment, error) {
	var eq models.Equipment
	var purchaseDate sql.NullTime
	var supplierID sql.NullInt64
	var createdAt sql.NullTime

	err := r.DB.QueryRow("SELECT id, name, price, purchase_date, status, supplier_id, created_at FROM equipments WHERE id=?", id).
		Scan(&eq.ID, &eq.Name, &eq.Price, &purchaseDate, &eq.Status, &supplierID, &createdAt)
	if err != nil {
		return nil, err
	}

	if purchaseDate.Valid {
		eq.PurchaseDate = purchaseDate.Time.Format("2006-01-02 15:04:05")
	}
	if supplierID.Valid {
		sid := int(supplierID.Int64)
		eq.SupplierID = &sid
	}
	if createdAt.Valid {
		eq.CreatedAt = createdAt.Time.Format("2006-01-02 15:04:05")
	}

	// Lấy lịch bảo trì
	rows, err := r.DB.Query("SELECT id, equipment_id, scheduled_date, description, status, technician_id, created_at FROM maintenance_schedules WHERE equipment_id=?", id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var schedules []models.MaintenanceSchedule
	for rows.Next() {
		var ms models.MaintenanceSchedule
		var techID sql.NullInt64
		var scheduledDate sql.NullTime
		var createdAt sql.NullTime

		if err := rows.Scan(&ms.ID, &ms.EquipmentID, &scheduledDate, &ms.Description, &ms.Status, &techID, &createdAt); err != nil {
			return nil, err
		}

		if scheduledDate.Valid {
			ms.ScheduledDate = scheduledDate.Time.Format("2006-01-02 15:04:05")
		}
		if techID.Valid {
			tid := int(techID.Int64)
			ms.TechnicianID = &tid
		}
		if createdAt.Valid {
			ms.CreatedAt = createdAt.Time.Format("2006-01-02 15:04:05")
		}

		schedules = append(schedules, ms)
	}
	eq.Schedules = schedules

	return &eq, nil
}
