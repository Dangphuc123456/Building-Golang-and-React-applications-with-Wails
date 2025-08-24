package repositories

import (
	"database/sql"
	"Device-t/backend/models"
	"time"
)

type MaintenanceRepository struct {
	DB *sql.DB
}

func NewMaintenanceRepository(db *sql.DB) *MaintenanceRepository {
	return &MaintenanceRepository{DB: db}
}

func (r *MaintenanceRepository) GetAll() ([]models.MaintenanceSchedule, error) {
	rows, err := r.DB.Query(`
		SELECT id, equipment_id, scheduled_date, description, status, technician_id, created_at 
		FROM maintenance_schedules
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var maintenances []models.MaintenanceSchedule
	for rows.Next() {
		var m models.MaintenanceSchedule
		var techID sql.NullInt64
		var scheduledDate sql.NullTime
		var createdAt sql.NullTime

		if err := rows.Scan(&m.ID, &m.EquipmentID, &scheduledDate, &m.Description, &m.Status, &techID, &createdAt); err != nil {
			return nil, err
		}

		if scheduledDate.Valid {
			m.ScheduledDate = scheduledDate.Time.Format("2006-01-02 15:04:05")
		}
		if techID.Valid {
			tid := int(techID.Int64)
			m.TechnicianID = &tid
		}
		if createdAt.Valid {
			m.CreatedAt = createdAt.Time.Format("2006-01-02 15:04:05")
		}

		maintenances = append(maintenances, m)
	}
	return maintenances, nil
}

func (r *MaintenanceRepository) Create(m *models.MaintenanceSchedule) error {
	now := time.Now().Format("2006-01-02 15:04:05")
	_, err := r.DB.Exec(
		"INSERT INTO maintenance_schedules (equipment_id, scheduled_date, description, status, technician_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
		m.EquipmentID, m.ScheduledDate, m.Description, m.Status, m.TechnicianID, now,
	)
	if err != nil {
		return err
	}

	_, err = r.DB.Exec("UPDATE equipments SET status = ? WHERE id = ?", "maintenance", m.EquipmentID)
	return err
}

func (r *MaintenanceRepository) Update(id int, m *models.MaintenanceSchedule) error {
	_, err := r.DB.Exec(`
		UPDATE maintenance_schedules
		SET scheduled_date=?, description=?, status=?, technician_id=?
		WHERE id=?`,
		m.ScheduledDate, m.Description, m.Status, m.TechnicianID, id,
	)
	return err
}

func (r *MaintenanceRepository) Delete(id int) error {
	_, err := r.DB.Exec("DELETE FROM repair_history WHERE maintenance_id = ?", id)
	if err != nil {
		return err
	}
	_, err = r.DB.Exec("DELETE FROM maintenance_schedules WHERE id = ?", id)
	return err
}

func (r *MaintenanceRepository) GetByID(id int) (*models.MaintenanceSchedule, error) {
	var m models.MaintenanceSchedule
	var techID sql.NullInt64
	var scheduledDate sql.NullTime
	var createdAt sql.NullTime

	err := r.DB.QueryRow(`
		SELECT id, equipment_id, scheduled_date, description, status, technician_id, created_at
		FROM maintenance_schedules
		WHERE id=?`, id).Scan(&m.ID, &m.EquipmentID, &scheduledDate, &m.Description, &m.Status, &techID, &createdAt)
	if err != nil {
		return nil, err
	}

	if scheduledDate.Valid {
		m.ScheduledDate = scheduledDate.Time.Format("2006-01-02 15:04:05")
	}
	if techID.Valid {
		t := int(techID.Int64)
		m.TechnicianID = &t
	}
	if createdAt.Valid {
		m.CreatedAt = createdAt.Time.Format("2006-01-02 15:04:05")
	}

	// Lấy RepairHistories
	rows, err := r.DB.Query(`
		SELECT id, maintenance_id, repair_date, issue_description, cost, technician_id, created_at
		FROM repair_history
		WHERE maintenance_id=? ORDER BY repair_date DESC
	`, m.ID)
	if err != nil {
		m.RepairHistories = []models.RepairHistory{}
		return &m, nil
	}
	defer rows.Close()

	var histories []models.RepairHistory
	for rows.Next() {
		var h models.RepairHistory
		var repairDate sql.NullTime
		var techID sql.NullInt64
		var createdAt sql.NullTime

		if err := rows.Scan(&h.ID, &h.MaintenanceID, &repairDate, &h.IssueDesc, &h.Cost, &techID, &createdAt); err != nil {
			continue
		}

		if repairDate.Valid {
			h.RepairDate = repairDate.Time.Format("2006-01-02 15:04:05")
		}
		if techID.Valid {
			t := int(techID.Int64)
			h.TechnicianID = &t
		}
		if createdAt.Valid {
			h.CreatedAt = createdAt.Time.Format("2006-01-02 15:04:05")
		}
		histories = append(histories, h)
	}

	m.RepairHistories = histories
	return &m, nil
}
