package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/erika-dalmagro/orders-backend/database"
	"github.com/erika-dalmagro/orders-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OrderRequest struct {
	TableID uint             `json:"table_id" binding:"required,gt=0"`
	Items   []OrderItemInput `json:"items" binding:"required,min=1,dive"`
	Date    string           `json:"date" binding:"required"`
}

type OrderItemInput struct {
	ProductID uint `json:"product_id" binding:"required,gt=0"`
	Quantity  int  `json:"quantity" binding:"required,gt=0"`
}

func CreateOrder(c *gin.Context) {
	var req OrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	parsedDate, err := time.Parse("2006-01-02", req.Date) // YYYY-MM-DD
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format for order. Use YYYY-MM-DD"})
		return
	}

	// 1. Check if table exists
	var table models.Table
	if err := database.DB.First(&table, req.TableID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Table not found"})
		return
	}

	// 2. Check if table has an open order ONLY IF SingleTab is true
	if table.SingleTab {
		var existingOpenOrder models.Order
		if err := database.DB.Where("table_id = ? AND status = ?", req.TableID, "open").First(&existingOpenOrder).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": fmt.Sprintf("Table %s already has an open order (Order ID: %d)", table.Name, existingOpenOrder.ID)})
			return
		} else if err != gorm.ErrRecordNotFound {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check table status"})
			return
		}
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
		TableID:       req.TableID,
		Status:        "open",
		Date:          parsedDate,
		KitchenStatus: "Waiting",
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

	database.DB.Preload("Table").Preload("Items.Product").First(&order, order.ID)
	c.JSON(http.StatusCreated, order)
}

func GetOrders(c *gin.Context) {
	var orders []models.Order
	database.DB.Preload("Table").Preload("Items.Product").Find(&orders)
	c.JSON(http.StatusOK, orders)
}

func GetOrdersByDate(c *gin.Context) {
	dateStr := c.Query("date") // YYYY-MM-DD
	if dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Date parameter is required"})
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}

	startOfDay := date.Truncate(24 * time.Hour)
	endOfDay := startOfDay.Add(24 * time.Hour).Add(-time.Second)

	var orders []models.Order
	if err := database.DB.Preload("Table").Preload("Items.Product").
		Where("date BETWEEN ? AND ?", startOfDay, endOfDay).
		Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders for the specified date"})
		return
	}
	c.JSON(http.StatusOK, orders)
}

func GetOrder(c *gin.Context) {
	id := c.Param("id")
	var order models.Order
	if err := database.DB.Preload("Table").Preload("Items.Product").First(&order, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch order"})
		return
	}
	c.JSON(http.StatusOK, order)
}

func CloseOrder(c *gin.Context) {
	id := c.Param("id")
	var order models.Order

	if err := database.DB.Preload("Table").First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	if order.Status == "closed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order already closed"})
		return
	}

	order.Status = "closed"
	database.DB.Save(&order)
	c.JSON(http.StatusOK, gin.H{"message": fmt.Sprintf("Order for table %s closed successfully", order.Table.Name)})
}

func UpdateOrder(c *gin.Context) {
	id := c.Param("id")
	var order models.Order
	var req OrderRequest
	if err := database.DB.Preload("Table").First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	parsedDate, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format for order update. Use YYYY-MM-DD"})
		return
	}
	order.Date = parsedDate

	var newTable models.Table
	if err := database.DB.First(&newTable, req.TableID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "New table not found"})
		return
	}

	if newTable.ID != order.TableID && newTable.SingleTab {
		var existingOpenOrder models.Order
		if err := database.DB.Where("table_id = ? AND status = ?", req.TableID, "open").First(&existingOpenOrder).Error; err == nil {
			c.JSON(http.StatusConflict, gin.H{"error": fmt.Sprintf("New table %s already has an open order (Order ID: %d)", newTable.Name, existingOpenOrder.ID)})
			return
		} else if err != gorm.ErrRecordNotFound {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check new table status"})
			return
		}
	}

	transactionErr := database.DB.Transaction(func(tx *gorm.DB) error {
		// Finds the old order items to restore stock
		var oldItems []models.OrderItem
		if err := tx.Where("order_id = ?", order.ID).Find(&oldItems).Error; err != nil {
			return err
		}

		// Restores stock for the removed products
		for _, item := range oldItems {
			if err := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
				Update("stock", gorm.Expr("stock + ?", item.Quantity)).Error; err != nil {
				return err
			}
		}

		// Deletes the old order items
		if err := tx.Where("order_id = ?", order.ID).Delete(&models.OrderItem{}).Error; err != nil {
			return err
		}

		// Checks stock for the new items
		for _, item := range req.Items {
			var product models.Product
			if err := tx.First(&product, item.ProductID).Error; err != nil {
				return fmt.Errorf("product with id %d not found", item.ProductID)
			}
			if product.Stock < item.Quantity {
				return fmt.Errorf("insufficient stock for product %s", product.Name)
			}
		}

		// Updates the table number and saves the order
		order.TableID = req.TableID
		if err := tx.Save(&order).Error; err != nil {
			return err
		}

		// Creates the new order items and updates stock
		for _, item := range req.Items {
			orderItem := models.OrderItem{
				OrderID:   order.ID,
				ProductID: item.ProductID,
				Quantity:  item.Quantity,
			}
			if err := tx.Create(&orderItem).Error; err != nil {
				return err
			}

			if err := tx.Model(&models.Product{}).Where("id = ?", item.ProductID).
				Update("stock", gorm.Expr("stock - ?", item.Quantity)).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if transactionErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order: " + transactionErr.Error()})
		return
	}

	database.DB.Preload("Table").Preload("Items.Product").First(&order, id)

	c.JSON(http.StatusOK, order)
}

func DeleteOrder(c *gin.Context) {
	id := c.Param("id")
	var order models.Order

	if err := database.DB.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	var orderItems []models.OrderItem
	database.DB.Where("order_id = ?", order.ID).Find(&orderItems)

	err := database.DB.Transaction(func(tx *gorm.DB) error {

		// Return stock for each product
		for _, item := range orderItems {
			if err := tx.Model(&models.Product{}).
				Where("id = ?", item.ProductID).
				Update("stock", gorm.Expr("stock + ?", item.Quantity)).Error; err != nil {
				return err
			}
		}

		// Delete order items
		if err := tx.Where("order_id = ?", order.ID).Delete(&models.OrderItem{}).Error; err != nil {
			return err
		}

		// Delete order
		if err := tx.Delete(&order).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error deleting order and restoring stock: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order deleted successfully and stock restored"})
}

// Status "open"
func GetKitchenOrders(c *gin.Context) {
	var orders []models.Order
	database.DB.Preload("Table").Preload("Items.Product").Where("status = ?", "open").Order("created_at asc").Find(&orders)
	c.JSON(http.StatusOK, orders)
}

type UpdateKitchenStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

func UpdateKitchenStatus(c *gin.Context) {
	id := c.Param("id")
	var order models.Order
	if err := database.DB.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	var req UpdateKitchenStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Status validation
	newStatus := req.Status
	if newStatus != "Waiting" && newStatus != "Preparing" && newStatus != "Ready" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid kitchen status"})
		return
	}

	order.KitchenStatus = newStatus
	database.DB.Save(&order)

	c.JSON(http.StatusOK, order)
}
