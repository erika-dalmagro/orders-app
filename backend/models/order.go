package models

import "gorm.io/gorm"

type Order struct {
	gorm.Model
	ID          uint        `json:"id" gorm:"primaryKey"`
	TableNumber uint        `json:"table_number"`
	Status      string      `json:"status" gorm:"index"`
	Items       []OrderItem `json:"items"`
}
