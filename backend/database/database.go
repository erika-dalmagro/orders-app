package database

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/erika-dalmagro/orders-backend/models"
)

var DB *gorm.DB

func Connect() {
	dsn := "host=localhost user=postgres password=senha246 dbname=orders port=5432 sslmode=disable"
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Database connection failed:", err)
	}
	fmt.Println("Database connected")

	DB.AutoMigrate(&models.Product{}, &models.Order{}, &models.OrderItem{})
}
