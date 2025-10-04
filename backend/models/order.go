package models

import (
	"time"

	"gorm.io/gorm"
)

type Order struct {
	gorm.Model
	ID            uint        `json:"id" gorm:"primaryKey"`
	TableID       uint        `json:"table_id" gorm:"index"`
	Table         Table       `json:"table" gorm:"foreignKey:TableID"`
	Status        string      `json:"status" gorm:"index"`
	KitchenStatus string      `json:"kitchen_status" gorm:"index;default:'Waiting'"`
	Items         []OrderItem `json:"items"`
	Date          time.Time   `json:"date"`
}
