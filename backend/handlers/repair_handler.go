// internal/handlers/repair_handler.go
package handlers

import (
	"encoding/json"
	"Device-t/backend/models"
	"Device-t/backend/services"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type RepairHandler struct {
	Service *services.RepairService
}

func (h *RepairHandler) GetAllRepairHistory(w http.ResponseWriter, r *http.Request) {
	data, err := h.Service.GetAllRepairHistories()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func (h *RepairHandler) CreateRepairHistory(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["maintenance_id"]
	id, _ := strconv.Atoi(idStr)

	var rh models.RepairHistory
	if err := json.NewDecoder(r.Body).Decode(&rh); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}
	rh.MaintenanceID = &id

	if err := h.Service.CreateRepairHistory(&rh); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(rh)
}

func (h *RepairHandler) UpdateRepairHistory(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["repair_id"]
	id, _ := strconv.Atoi(idStr)

	var rh models.RepairHistory
	if err := json.NewDecoder(r.Body).Decode(&rh); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}

	if err := h.Service.UpdateRepairHistory(id, &rh); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	rh.ID = id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rh)
}

func (h *RepairHandler) DeleteRepairHistory(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["repair_id"]
	id, _ := strconv.Atoi(idStr)

	if err := h.Service.DeleteRepairHistory(id); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
