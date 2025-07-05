package routes

import (
	"github.com/erika-dalmagro/orders-backend/controllers"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	r.GET("/products", controllers.GetProducts)
	r.POST("/products", controllers.CreateProduct)

	r.POST("/orders", controllers.CreateOrder)
	r.GET("/orders", controllers.GetOrders)
	r.PUT("/orders/:id/close", controllers.CloseOrder)
}
