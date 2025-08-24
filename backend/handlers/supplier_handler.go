// internal/handlers/supplier_handler.go
package handlers

import (
	"encoding/json"
	"Device-t/backend/models"
	"Device-t/backend/services"
	
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type SupplierHandler struct {
	Service *services.SupplierService
}

func (h *SupplierHandler) GetAllSuppliers(w http.ResponseWriter, r *http.Request) {
	suppliers, err := h.Service.GetAll()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(suppliers)
}

func (h *SupplierHandler) CreateSupplier(w http.ResponseWriter, r *http.Request) {
	var s models.Supplier
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}
	if err := h.Service.Create(&s); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(s)
}

func (h *SupplierHandler) UpdateSupplier(w http.ResponseWriter, r *http.Request) {
    params := mux.Vars(r)
    id, err := strconv.Atoi(params["id"])
    if err != nil {
        http.Error(w, "Invalid supplier ID", http.StatusBadRequest)
        return
    }

    var s models.Supplier
    if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }
    s.ID = id

    if err := h.Service.Update(&s); err != nil {
        http.Error(w, err.Error(), http.StatusNotFound) // nếu không tìm thấy thì trả về 404
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(s)
}


func (h *SupplierHandler) DeleteSupplier(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	if err := h.Service.Delete(id); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *SupplierHandler) GetSupplierDetail(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	s, err := h.Service.GetByID(id)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(s)
}

func (h *SupplierHandler) CreateEquipment(w http.ResponseWriter, r *http.Request) {
	supplierID, _ := strconv.Atoi(mux.Vars(r)["supplier_id"])
	var eq models.Equipment
	if err := json.NewDecoder(r.Body).Decode(&eq); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}
	eq.SupplierID = &supplierID
	if err := h.Service.CreateEquipment(&eq); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(eq)
}

func (h *SupplierHandler) UpdateEquipment(w http.ResponseWriter, r *http.Request) {
	supplierID, _ := strconv.Atoi(mux.Vars(r)["supplier_id"])
	equipmentID, _ := strconv.Atoi(mux.Vars(r)["equipment_id"])
	var eq models.Equipment
	if err := json.NewDecoder(r.Body).Decode(&eq); err != nil {
		http.Error(w, "Invalid JSON", 400)
		return
	}
	eq.ID = equipmentID
	eq.SupplierID = &supplierID
	if err := h.Service.UpdateEquipment(&eq); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	json.NewEncoder(w).Encode(eq)
}

func (h *SupplierHandler) DeleteEquipment(w http.ResponseWriter, r *http.Request) {
	equipmentID, _ := strconv.Atoi(mux.Vars(r)["equipment_id"])
	if err := h.Service.DeleteEquipment(equipmentID); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
