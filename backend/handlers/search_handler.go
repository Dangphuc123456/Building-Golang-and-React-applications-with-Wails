// internal/handlers/search_handler.go
package handlers

import (
	"encoding/json"
	"Device-t/backend/services"
	"net/http"
	"strconv"
)

type SearchHandler struct {
	Service *services.SearchService
}

// GET /search?q=...
func (h *SearchHandler) SearchAll(w http.ResponseWriter, r *http.Request) {
	keyword := r.URL.Query().Get("q")
	if keyword == "" {
		http.Error(w, "query param q required", 400)
		return
	}

	results, err := h.Service.SearchAll(keyword)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// GET /search/detail?type=...&id=...
func (h *SearchHandler) GetDetail(w http.ResponseWriter, r *http.Request) {
	qType := r.URL.Query().Get("type")
	idStr := r.URL.Query().Get("id")
	id, _ := strconv.Atoi(idStr)

	result, err := h.Service.GetDetail(qType, id)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	if result == nil {
		http.Error(w, "invalid type", 400)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
