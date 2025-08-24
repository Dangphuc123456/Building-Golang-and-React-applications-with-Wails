package main

import (
	"context"
	"Device-t/backend/config" 
	"Device-t/backend/repositories"
	"Device-t/backend/services"
	"Device-t/backend/models"
	"database/sql"
	"os"
    _ "github.com/go-sql-driver/mysql"
)
func initDB() *sql.DB {
    db, err := sql.Open("mysql", "user:password@tcp(localhost:3306)/device_t")
    if err != nil {
        panic(err)
    }
    return db
}
type App struct {
	ctx context.Context

	userService     *services.UserService
	equipService    *services.EquipmentService
	supplierService *services.SupplierService
	maintService    *services.MaintenanceService
	repairService   *services.RepairService
	searchService   *services.SearchService
}

// Khởi tạo App với tất cả service
func NewApp() *App {
	// Khởi tạo các repository với cùng 1 DB
	userRepo := &repositories.UserRepository{DB: config.DB}
	equipRepo := &repositories.EquipmentRepository{DB: config.DB}
	supplierRepo := &repositories.SupplierRepository{DB: config.DB}
	maintRepo := &repositories.MaintenanceRepository{DB: config.DB}
	repairRepo := &repositories.RepairRepository{DB: config.DB}
	searchRepo := &repositories.SearchRepository{DB: config.DB}

	// Khởi tạo các service
	userService := services.NewUserService(userRepo)
	equipService := services.NewEquipmentService(equipRepo)
	supplierService := services.NewSupplierService(supplierRepo, equipRepo)
	maintService := services.NewMaintenanceService(maintRepo)
	repairService := services.NewRepairService(repairRepo)
	searchService := services.NewSearchService(searchRepo)

	return &App{
		userService:     userService,
		equipService:    equipService,
		supplierService: supplierService,
		maintService:    maintService,
		repairService:   repairService,
		searchService:   searchService,
	}
}

// Startup được Wails gọi khi khởi động app
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}

// --- Expose method cho FE ---
// User
func (a *App) Login(email, password string) (string, error) {
	return a.userService.Login(email, password, "mysecretjwt")
}

func (a *App) GetAllUsers() ([]models.User, error) {
	return a.userService.GetAllUsers()
}
func (a *App) UpdateUser(u models.User) error {
	return a.userService.UpdateUser(&u) 
}

func (a *App) DeleteUser(id int) error {
	return a.userService.DeleteUser(id) 
}
func (a *App) Logout() error {
    return nil
}

func (a *App) RegisterUser(u models.User) (string, error) {
    jwtSecret := os.Getenv("JWT_SECRET")
    return a.userService.Register(u, jwtSecret) 
}

func (a *App) CompleteRegister(token string, otp string) (string, error) {
    jwtSecret := os.Getenv("JWT_SECRET")
    return a.userService.CompleteRegister(token, otp, jwtSecret)
}

// Equipment
func (a *App) GetAllEquipment() ([]models.Equipment, error) {
	return a.equipService.GetAllEquipments()
}
func (a *App) CreateEquipment(e models.Equipment) error {
	return a.equipService.CreateEquipment(&e)
}
func (a *App) UpdateEquipment(id int, e models.Equipment) error {
	return a.equipService.UpdateEquipment(id, &e)
}
func (a *App) DeleteEquipment(id int) error {
	return a.equipService.DeleteEquipment(id)
}

// Supplier
func (a *App) GetAllSuppliers() ([]models.Supplier, error) {
	return a.supplierService.GetAll()
}
func (a *App) CreateSupplier(s models.Supplier) error {
	return a.supplierService.Create(&s)
}
func (a *App) UpdateSupplier(s models.Supplier) error {
	return a.supplierService.Update(&s)
}
func (a *App) DeleteSupplier(id int) error {
	return a.supplierService.Delete(id)
}

// Maintenance
func (a *App) GetAllMaintenances() ([]models.MaintenanceSchedule, error) {
	return a.maintService.GetAllMaintenances()
}
func (a *App) CreateMaintenance(m models.MaintenanceSchedule) error {
	return a.maintService.CreateMaintenance(&m)
}
func (a *App) UpdateMaintenance(id int, m models.MaintenanceSchedule) error {
	return a.maintService.UpdateMaintenance(id, &m)
}
func (a *App) DeleteMaintenance(id int) error {
	return a.maintService.DeleteMaintenance(id)
}

// Repair history
func (a *App) GetRepairHistoryByMaintenance(maintID int) ([]models.RepairHistory, error) {
	return a.repairService.GetByMaintenance(maintID)
}
func (a *App) AddRepairHistory(h models.RepairHistory) error {
	return a.repairService.CreateRepairHistory(&h)
}
func (a *App) UpdateRepairHistory(id int, h models.RepairHistory) error {
	return a.repairService.UpdateRepairHistory(id, &h)
}
func (a *App) DeleteRepairHistory(id int) error {
	return a.repairService.DeleteRepairHistory(id)
}

// Search
func (a *App) SearchAll(keyword string) ([]models.SearchResult, error) {
	return a.searchService.SearchAll(keyword)
}
func (a *App) GetSearchDetail(qType string, id int) (interface{}, error) {
	return a.searchService.GetDetail(qType, id)
}
// Supplier - lấy chi tiết
func (a *App) GetSupplierByID(id int) (*models.Supplier, error) {
	return a.supplierService.GetByID(id)
}

// Equipment - lấy chi tiết
func (a *App) GetEquipmentDetail(id int) (*models.Equipment, error) {
	return a.equipService.GetEquipmentDetail(id)
}

// Maintenance - lấy chi tiết (bao gồm cả repair history)
func (a *App) GetMaintenanceDetail(id int) (*models.MaintenanceSchedule, error) {
    return a.maintService.GetByID(id)
}

// RepairHistory - lấy theo MaintenanceID
func (a *App) GetRepairByMaintenance(maintID int) ([]models.RepairHistory, error) {
	return a.repairService.GetByMaintenance(maintID)
}

func (a *App) GetAllRepairHistories() ([]models.RepairHistory, error) {
    return a.repairService.GetAllRepairHistories()
}