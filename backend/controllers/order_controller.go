package controllers

import (
	"net/http"

	"github.com/erika-dalmagro/orders-backend/database"
	"github.com/erika-dalmagro/orders-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OrderRequest struct {
	TableNumber uint             `json:"table_number"`
	Items       []OrderItemInput `json:"items"`
}

type OrderItemInput struct {
	ProductID uint `json:"product_id"`
	Quantity  int  `json:"quantity"`
}

func CreateOrder(c *gin.Context) {
	var req OrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check stock for each item
	for _, item := range req.Items {
		var product models.Product
		if err := database.DB.First(&product, item.ProductID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Product not found"})
			return
		}
		if product.Stock < item.Quantity {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Insufficient stock for product " + product.Name,
			})
			return
		}
	}

	// Create order
	order := models.Order{
		TableNumber: req.TableNumber,
		Status:      "open",
	}
	database.DB.Create(&order)

	// Create items and update stock
	for _, item := range req.Items {
		orderItem := models.OrderItem{
			OrderID:   order.ID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
		}
		database.DB.Create(&orderItem)

		// Update stock
		database.DB.Model(&models.Product{}).
			Where("id = ?", item.ProductID).
			Update("stock", gorm.Expr("stock - ?", item.Quantity))
	}

	c.JSON(http.StatusCreated, order)
}

func GetOrders(c *gin.Context) {
	var orders []models.Order
	database.DB.Preload("Items.Product").Find(&orders)
	c.JSON(http.StatusOK, orders)
}

func CloseOrder(c *gin.Context) {
	id := c.Param("id")
	var order models.Order

	if err := database.DB.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	if order.Status == "closed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order already closed"})
		return
	}

	order.Status = "closed"
	database.DB.Save(&order)
	c.JSON(http.StatusOK, gin.H{"message": "Order closed successfully"})
}
