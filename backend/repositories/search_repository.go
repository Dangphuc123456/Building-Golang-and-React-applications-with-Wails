// internal/repositories/search_repository.go
package repositories

import (
	"database/sql"
	"Device-t/backend/models"
)

type SearchRepository struct {
	DB *sql.DB
}

func NewSearchRepository(db *sql.DB) *SearchRepository {
	return &SearchRepository{DB: db}
}

// Tìm kiếm chung
func (r *SearchRepository) SearchAll(keyword string) ([]models.SearchResult, error) {
	likeKeyword := "%" + keyword + "%"
	results := []models.SearchResult{}

	// --- equipments ---
	rows, err := r.DB.Query("SELECT id, name FROM equipments WHERE name LIKE ? COLLATE utf8_general_ci", likeKeyword)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var id int
		var name string
		if err := rows.Scan(&id, &name); err != nil {
			return nil, err
		}
		results = append(results, models.SearchResult{ID: id, Name: name, Type: "equipment"})
	}

	// --- maintenance schedules ---
	rows2, err := r.DB.Query("SELECT id, description FROM maintenance_schedules WHERE description LIKE ? COLLATE utf8_general_ci", likeKeyword)
	if err != nil {
		return nil, err
	}
	defer rows2.Close()
	for rows2.Next() {
		var id int
		var desc string
		if err := rows2.Scan(&id, &desc); err != nil {
			return nil, err
		}
		results = append(results, models.SearchResult{ID: id, Name: desc, Type: "maintenance"})
	}

	// --- repair histories ---
	rows3, err := r.DB.Query("SELECT id, issue_description FROM repair_history WHERE issue_description LIKE ? COLLATE utf8_general_ci", likeKeyword)
	if err != nil {
		return nil, err
	}
	defer rows3.Close()
	for rows3.Next() {
		var id int
		var issue string
		if err := rows3.Scan(&id, &issue); err != nil {
			return nil, err
		}
		results = append(results, models.SearchResult{ID: id, Name: issue, Type: "repair"})
	}

	// --- suppliers ---
	rows4, err := r.DB.Query("SELECT id, name FROM suppliers WHERE name LIKE ? COLLATE utf8_general_ci", likeKeyword)
	if err != nil {
		return nil, err
	}
	defer rows4.Close()
	for rows4.Next() {
		var id int
		var name string
		if err := rows4.Scan(&id, &name); err != nil {
			return nil, err
		}
		results = append(results, models.SearchResult{ID: id, Name: name, Type: "supplier"})
	}

	return results, nil
}

// Lấy chi tiết theo type + id
func (r *SearchRepository) GetDetail(qType string, id int) (interface{}, error) {
	switch qType {
	case "equipment":
		var eq models.Equipment
		err := r.DB.QueryRow("SELECT id, nam, purchase_date, status, price, supplier_id, created_at FROM equipments WHERE id=?", id).
			Scan(&eq.ID, &eq.Name, &eq.PurchaseDate, &eq.Status, &eq.Price, &eq.SupplierID, &eq.CreatedAt)
		return eq, err
	case "maintenance":
		var ms models.MaintenanceSchedule
		err := r.DB.QueryRow("SELECT id, equipment_id, scheduled_date, description, status, technician_id, created_at FROM maintenance_schedules WHERE id=?", id).
			Scan(&ms.ID, &ms.EquipmentID, &ms.ScheduledDate, &ms.Description, &ms.Status, &ms.TechnicianID, &ms.CreatedAt)
		return ms, err
	case "repair":
		var rh models.RepairHistory
		err := r.DB.QueryRow("SELECT id, repair_date, issue_description, cost, technician_id, created_at, maintenance_id FROM repair_history WHERE id=?", id).
			Scan(&rh.ID, &rh.RepairDate, &rh.IssueDesc, &rh.Cost, &rh.TechnicianID, &rh.CreatedAt, &rh.MaintenanceID)
		return rh, err
	case "supplier":
		var sp models.Supplier
		err := r.DB.QueryRow("SELECT id, name, phone, email, address, created_at FROM suppliers WHERE id=?", id).
			Scan(&sp.ID, &sp.Name, &sp.Phone, &sp.Email, &sp.Address, &sp.CreatedAt)
		return sp, err
	default:
		return nil, nil
	}
}
