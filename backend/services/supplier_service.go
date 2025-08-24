package services

import (
	"Device-t/backend/models"
	"Device-t/backend/repositories"
)

type SupplierService struct {
	Repo      *repositories.SupplierRepository
	EquipRepo *repositories.EquipmentRepository
}

func NewSupplierService(repo *repositories.SupplierRepository, equipRepo *repositories.EquipmentRepository) *SupplierService {
	return &SupplierService{Repo: repo, EquipRepo: equipRepo}
}

// Supplier CRUD
func (s *SupplierService) GetAll() ([]models.Supplier, error) {
	return s.Repo.GetAll()
}

func (s *SupplierService) Create(supplier *models.Supplier) error {
	return s.Repo.Create(supplier)
}

func (s *SupplierService) Update(supplier *models.Supplier) error {
	return s.Repo.Update(supplier)
}

func (s *SupplierService) Delete(id int) error {
	return s.Repo.Delete(id)
}

func (s *SupplierService) GetByID(id int) (*models.Supplier, error) {
	return s.Repo.GetByID(id)
}

// Equipment CRUD
func (s *SupplierService) CreateEquipment(eq *models.Equipment) error {
	return s.EquipRepo.Create(eq)
}

func (s *SupplierService) UpdateEquipment(eq *models.Equipment) error {
	return s.EquipRepo.Update(eq.ID, eq)
}

func (s *SupplierService) DeleteEquipment(id int) error {
	return s.EquipRepo.Delete(id)
}
