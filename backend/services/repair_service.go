// internal/services/repair_service.go
package services

import (
	"Device-t/backend/models"
	"Device-t/backend/repositories"
)

type RepairService struct {
	Repo *repositories.RepairRepository
}

func NewRepairService(repo *repositories.RepairRepository) *RepairService {
	return &RepairService{Repo: repo}
}

func (s *RepairService) GetAllRepairHistories() ([]models.RepairHistory, error) {
	return s.Repo.GetAll()
}

func (s *RepairService) CreateRepairHistory(rh *models.RepairHistory) error {
	return s.Repo.Create(rh)
}

func (s *RepairService) UpdateRepairHistory(id int, rh *models.RepairHistory) error {
	return s.Repo.Update(id, rh)
}

func (s *RepairService) DeleteRepairHistory(id int) error {
	return s.Repo.Delete(id)
}
func (s *RepairService) GetByMaintenance(maintID int) ([]models.RepairHistory, error) {
    return s.Repo.GetByMaintenanceID(maintID)
}
