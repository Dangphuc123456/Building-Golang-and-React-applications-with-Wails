// internal/handlers/maintenance_handler.go
package handlers

import (
	"encoding/json"
	"Device-t/backend/models"
	"Device-t/backend/services"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type MaintenanceHandler struct {
	Service *services.MaintenanceService
}

func (h *MaintenanceHandler) GetMaintenances(w http.ResponseWriter, r *http.Request) {
	data, err := h.Service.GetAllMaintenances()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func (h *MaintenanceHandler) CreateMaintenance(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	equipID, _ := strconv.Atoi(idStr)

	var m models.MaintenanceSchedule
	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}
	m.EquipmentID = equipID

	if err := h.Service.CreateMaintenance(&m); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Maintenance created and technician notified"})
}

func (h *MaintenanceHandler) UpdateMaintenance(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	id, _ := strconv.Atoi(idStr)

	var m models.MaintenanceSchedule
	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}

	if err := h.Service.UpdateMaintenance(id, &m); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	json.NewEncoder(w).Encode(m)
}

func (h *MaintenanceHandler) DeleteMaintenance(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	id, _ := strconv.Atoi(idStr)

	if err := h.Service.DeleteMaintenance(id); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *MaintenanceHandler) GetMaintenanceDetail(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	id, _ := strconv.Atoi(idStr)

	data, err := h.Service.GetMaintenanceDetail(id)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}



