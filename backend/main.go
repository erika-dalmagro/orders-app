package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/erika-dalmagro/orders-backend/database"
	"github.com/erika-dalmagro/orders-backend/routes"
)

func main() {
	r := gin.Default()
	r.Use(cors.Default())

	database.Connect()
	routes.RegisterRoutes(r)

	r.Run(":8080")
}
