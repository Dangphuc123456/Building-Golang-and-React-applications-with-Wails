package repositories

import (
	"database/sql"
	"Device-t/backend/models"
	"time"
)

type RepairRepository struct {
	DB *sql.DB
}

func NewRepairRepository(db *sql.DB) *RepairRepository {
	return &RepairRepository{DB: db}
}

func (r *RepairRepository) GetAll() ([]models.RepairHistory, error) {
	rows, err := r.DB.Query(`
		SELECT id, repair_date, issue_description, cost, technician_id, created_at, maintenance_id
		FROM repair_history
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var histories []models.RepairHistory
	for rows.Next() {
		var rh models.RepairHistory
		var techID sql.NullInt64
		var repairDate sql.NullTime
		var createdAt sql.NullTime

		if err := rows.Scan(&rh.ID, &repairDate, &rh.IssueDesc, &rh.Cost, &techID, &createdAt, &rh.MaintenanceID); err != nil {
			return nil, err
		}

		if repairDate.Valid {
			rh.RepairDate = repairDate.Time.Format("2006-01-02 15:04:05")
		}
		if techID.Valid {
			tid := int(techID.Int64)
			rh.TechnicianID = &tid
		}
		if createdAt.Valid {
			rh.CreatedAt = createdAt.Time.Format("2006-01-02 15:04:05")
		}

		histories = append(histories, rh)
	}
	return histories, nil
}

func (r *RepairRepository) Create(rh *models.RepairHistory) error {
	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	now := time.Now().Format("2006-01-02 15:04:05")
	rh.CreatedAt = now
	res, err := tx.Exec(`
		INSERT INTO repair_history (maintenance_id, repair_date, issue_description, cost, technician_id, created_at)
		VALUES (?, ?, ?, ?, ?, ?)`,
		rh.MaintenanceID, rh.RepairDate, rh.IssueDesc, rh.Cost, rh.TechnicianID, now,
	)
	if err != nil {
		tx.Rollback()
		return err
	}

	lastID, _ := res.LastInsertId()
	rh.ID = int(lastID)

	_, err = tx.Exec("UPDATE maintenance_schedules SET status=? WHERE id=?", "completed", rh.MaintenanceID)
	if err != nil {
		tx.Rollback()
		return err
	}

	var equipmentID int
	err = tx.QueryRow("SELECT equipment_id FROM maintenance_schedules WHERE id=?", rh.MaintenanceID).Scan(&equipmentID)
	if err != nil {
		tx.Rollback()
		return err
	}

	_, err = tx.Exec("UPDATE equipments SET status=? WHERE id=?", "active", equipmentID)
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}

func (r *RepairRepository) Update(id int, rh *models.RepairHistory) error {
	_, err := r.DB.Exec(`
		UPDATE repair_history
		SET repair_date=?, issue_description=?, cost=?, technician_id=?
		WHERE id=?`,
		rh.RepairDate, rh.IssueDesc, rh.Cost, rh.TechnicianID, id,
	)
	return err
}

func (r *RepairRepository) Delete(id int) error {
	_, err := r.DB.Exec("DELETE FROM repair_history WHERE id=?", id)
	return err
}

func (r *RepairRepository) GetByMaintenanceID(maintID int) ([]models.RepairHistory, error) {
	rows, err := r.DB.Query(`
        SELECT id, repair_date, issue_description, cost, technician_id, maintenance_id, created_at
        FROM repair_history
        WHERE maintenance_id=?
        ORDER BY created_at DESC
    `, maintID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var histories []models.RepairHistory
	for rows.Next() {
		var rh models.RepairHistory
		var techID sql.NullInt64
		var repairDate sql.NullTime
		var createdAt sql.NullTime

		if err := rows.Scan(&rh.ID, &repairDate, &rh.IssueDesc, &rh.Cost, &techID, &rh.MaintenanceID, &createdAt); err != nil {
			return nil, err
		}
		if repairDate.Valid {
			rh.RepairDate = repairDate.Time.Format("2006-01-02 15:04:05")
		}
		if techID.Valid {
			tid := int(techID.Int64)
			rh.TechnicianID = &tid
		}
		if createdAt.Valid {
			rh.CreatedAt = createdAt.Time.Format("2006-01-02 15:04:05")
		}
		histories = append(histories, rh)
	}
	return histories, nil
}
