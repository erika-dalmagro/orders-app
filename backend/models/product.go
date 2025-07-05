package models

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	ID          uint        `json:"id" gorm:"primaryKey"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Stock int     `json:"stock"`
}
