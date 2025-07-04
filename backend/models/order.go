package models

import "gorm.io/gorm"

type Order struct {
	gorm.Model
	TableNumber uint        `json:"table_number"`
	Status      string      `json:"status"` // e.g. "open", "closed"
	Items       []OrderItem `json:"items"`
}
