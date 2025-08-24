package handlers

import (
	"encoding/json"
	"net/http"
	"Device-t/backend/services"
	 "Device-t/backend/models"
	"strconv"

	"github.com/gorilla/mux"
)

type EquipmentHandler struct {
	Service *services.EquipmentService
}

func (h *EquipmentHandler) GetEquipments(w http.ResponseWriter, r *http.Request) {
	data, err := h.Service.GetAllEquipments()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func (h *EquipmentHandler) CreateEquipment(w http.ResponseWriter, r *http.Request) {
	var eq models.Equipment
	if err := json.NewDecoder(r.Body).Decode(&eq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.Service.CreateEquipment(&eq); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(eq)
}

func (h *EquipmentHandler) UpdateEquipment(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	var eq models.Equipment
	if err := json.NewDecoder(r.Body).Decode(&eq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.Service.UpdateEquipment(id, &eq); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Equipment updated successfully"})
}

func (h *EquipmentHandler) DeleteEquipment(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	if err := h.Service.DeleteEquipment(id); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"message": "Equipment deleted successfully"})
}

func (h *EquipmentHandler) GetEquipmentStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.Service.GetEquipmentStats()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(stats)
}

func (h *EquipmentHandler) GetEquipmentDetail(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	eq, err := h.Service.GetEquipmentDetail(id)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(eq)
}