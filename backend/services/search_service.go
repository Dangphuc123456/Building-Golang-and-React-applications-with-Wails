// internal/services/search_service.go
package services

import (
	"Device-t/backend/models"
	"Device-t/backend/repositories"
)

type SearchService struct {
	Repo *repositories.SearchRepository
}

func NewSearchService(repo *repositories.SearchRepository) *SearchService {
	return &SearchService{Repo: repo}
}

func (s *SearchService) SearchAll(keyword string) ([]models.SearchResult, error) {
	return s.Repo.SearchAll(keyword)
}

func (s *SearchService) GetDetail(qType string, id int) (interface{}, error) {
	return s.Repo.GetDetail(qType, id)
}
