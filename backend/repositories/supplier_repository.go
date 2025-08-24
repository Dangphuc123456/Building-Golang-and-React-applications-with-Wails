// internal/repositories/supplier_repository.go
package repositories

import (
	"database/sql"
	"Device-t/backend/models"
	"fmt"
)

type SupplierRepository struct {
	DB *sql.DB
}

func NewSupplierRepository(db *sql.DB) *SupplierRepository {
	return &SupplierRepository{DB: db}
}

// --- Supplier CRUD ---
func (r *SupplierRepository) GetAll() ([]models.Supplier, error) {
	rows, err := r.DB.Query("SELECT id, name, phone, email, address, created_at FROM suppliers")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var suppliers []models.Supplier
	for rows.Next() {
		var s models.Supplier
		var createdAt sql.NullTime

		if err := rows.Scan(&s.ID, &s.Name, &s.Phone, &s.Email, &s.Address, &createdAt); err != nil {
			return nil, err
		}
		if createdAt.Valid {
			s.CreatedAt = createdAt.Time.Format("2006-01-02 15:04:05")
		} else {
			s.CreatedAt = ""
		}

		suppliers = append(suppliers, s)
	}
	return suppliers, nil
}

func (r *SupplierRepository) Create(s *models.Supplier) error {
	result, err := r.DB.Exec(
		"INSERT INTO suppliers (name, phone, email, address) VALUES (?, ?, ?, ?)",
		s.Name, s.Phone, s.Email, s.Address,
	)
	if err != nil {
		return err
	}
	lastID, _ := result.LastInsertId()
	s.ID = int(lastID)
	// Không set CreatedAt vì Wails không cần time.Time
	return nil
}

func (r *SupplierRepository) Update(s *models.Supplier) error {
	result, err := r.DB.Exec(
		"UPDATE suppliers SET name=?, phone=?, email=?, address=? WHERE id=?",
		s.Name, s.Phone, s.Email, s.Address, s.ID,
	)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return fmt.Errorf("supplier with id %d not found", s.ID)
	}

	return nil
}

func (r *SupplierRepository) Delete(id int) error {
	// xóa repair_history + maintenance_schedules + equipments
	_, err := r.DB.Exec(`
		DELETE rh FROM repair_history rh
		JOIN maintenance_schedules ms ON rh.maintenance_id = ms.id
		JOIN equipments e ON ms.equipment_id = e.id
		WHERE e.supplier_id = ?`, id)
	if err != nil {
		return err
	}

	_, err = r.DB.Exec(`
		DELETE ms FROM maintenance_schedules ms
		JOIN equipments e ON ms.equipment_id = e.id
		WHERE e.supplier_id = ?`, id)
	if err != nil {
		return err
	}

	_, err = r.DB.Exec("DELETE FROM equipments WHERE supplier_id = ?", id)
	if err != nil {
		return err
	}

	_, err = r.DB.Exec("DELETE FROM suppliers WHERE id = ?", id)
	return err
}

func (r *SupplierRepository) GetByID(id int) (*models.Supplier, error) {
	var s models.Supplier
	var createdAt sql.NullTime

	err := r.DB.QueryRow("SELECT id, name, phone, email, address, created_at FROM suppliers WHERE id=?", id).
		Scan(&s.ID, &s.Name, &s.Phone, &s.Email, &s.Address, &createdAt)
	if err != nil {
		return nil, err
	}
	if createdAt.Valid {
		s.CreatedAt = createdAt.Time.Format("2006-01-02 15:04:05")
	} else {
		s.CreatedAt = ""
	}

	// Lấy equipments của supplier
	rows, err := r.DB.Query("SELECT id, name, price, purchase_date, status, supplier_id, created_at FROM equipments WHERE supplier_id=?", id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var equipments []models.Equipment
	for rows.Next() {
		var eq models.Equipment
		var purchaseDate sql.NullTime
		var createdAt sql.NullTime

		if err := rows.Scan(&eq.ID, &eq.Name, &eq.Price, &purchaseDate, &eq.Status, &eq.SupplierID, &createdAt); err != nil {
			return nil, err
		}

		if purchaseDate.Valid {
			eq.PurchaseDate = purchaseDate.Time.Format("2006-01-02 15:04:05")
		} else {
			eq.PurchaseDate = ""
		}

		if createdAt.Valid {
			eq.CreatedAt = createdAt.Time.Format("2006-01-02 15:04:05")
		} else {
			eq.CreatedAt = ""
		}

		equipments = append(equipments, eq)
	}
	s.Equipments = equipments
	return &s, nil
}
