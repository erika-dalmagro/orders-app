package routes

import (
	"github.com/erika-dalmagro/orders-backend/controllers"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	// Products
	r.GET("/products", controllers.GetProducts)
	r.POST("/products", controllers.CreateProduct)
	r.PUT("/products/:id", controllers.UpdateProduct)
	r.DELETE("/products/:id", controllers.DeleteProduct)

	// Orders
	r.POST("/orders", controllers.CreateOrder)
	r.GET("/orders", controllers.GetOrders)
	r.PUT("/orders/:id/close", controllers.CloseOrder)
	r.PUT("/orders/:id", controllers.UpdateOrder)
	r.DELETE("/orders/:id", controllers.DeleteOrder)
	r.GET("/orders/:id", controllers.GetOrder)
	r.GET("/orders/by-date", controllers.GetOrdersByDate)

	// Tables
	r.POST("/tables", controllers.CreateTable)
	r.GET("/tables", controllers.GetTables)
	r.GET("/tables/available", controllers.GetAvailableTables)
	r.GET("/tables/:id", controllers.GetTable)
	r.PUT("/tables/:id", controllers.UpdateTable)
	r.DELETE("/tables/:id", controllers.DeleteTable)
}
