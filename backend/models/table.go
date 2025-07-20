package models

import "gorm.io/gorm"

type Table struct {
	gorm.Model
	ID       uint   `json:"id" gorm:"primaryKey"`
	Name     string `json:"name" binding:"required"`
	Capacity int    `json:"capacity" binding:"required,gt=0"`
}