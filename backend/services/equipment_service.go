// internal/services/equipment_service.go
package services

import (
	"Device-t/backend/models"
	"Device-t/backend/repositories"
)

type EquipmentService struct {
	Repo *repositories.EquipmentRepository
}

func NewEquipmentService(repo *repositories.EquipmentRepository) *EquipmentService {
	return &EquipmentService{Repo: repo}
}

func (s *EquipmentService) GetAllEquipments() ([]models.Equipment, error) {
	return s.Repo.GetAll()
}

func (s *EquipmentService) CreateEquipment(eq *models.Equipment) error {
	// Bạn có thể thêm validate ở đây
	if eq.Name == "" {
		return &CustomError{"Name is required"}
	}
	return s.Repo.Create(eq)
}

func (s *EquipmentService) UpdateEquipment(id int, eq *models.Equipment) error {
	return s.Repo.Update(id, eq)
}

func (s *EquipmentService) DeleteEquipment(id int) error {
	return s.Repo.Delete(id)
}

func (s *EquipmentService) GetEquipmentStats() (map[string]int, error) {
	return s.Repo.GetStats()
}

func (s *EquipmentService) GetEquipmentDetail(id int) (*models.Equipment, error) {
	return s.Repo.GetByID(id)
}

type CustomError struct {
	Message string
}

func (e *CustomError) Error() string {
	return e.Message
}
