package controllers

import (
	"net/http"

	"github.com/erika-dalmagro/orders-backend/database"
	"github.com/erika-dalmagro/orders-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TableRequest struct {
	Name      string `json:"name" binding:"required"`
	Capacity  int    `json:"capacity" binding:"required,gt=0"`
	SingleTab *bool  `json:"single_tab"`
}

func CreateTable(c *gin.Context) {
	var req TableRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	table := models.Table{
		Name:     req.Name,
		Capacity: req.Capacity,
	}

	if req.SingleTab != nil {
		table.SingleTab = *req.SingleTab
	} else {
		table.SingleTab = true
	}

	if err := database.DB.Create(&table).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create table"})
		return
	}

	c.JSON(http.StatusCreated, table)
}

func GetTables(c *gin.Context) {
	var tables []models.Table
	if err := database.DB.Find(&tables).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tables"})
		return
	}

	c.JSON(http.StatusOK, tables)
}

func GetTable(c *gin.Context) {
	id := c.Param("id")
	var table models.Table
	if err := database.DB.First(&table, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Table not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch table"})
		return
	}
	c.JSON(http.StatusOK, table)
}

func UpdateTable(c *gin.Context) {
	id := c.Param("id")
	var table models.Table
	if err := database.DB.First(&table, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Table not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch table"})
		return
	}

	var req TableRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	table.Name = req.Name
	table.Capacity = req.Capacity
	if req.SingleTab != nil {
		table.SingleTab = *req.SingleTab
	}

	if err := database.DB.Save(&table).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update table"})
		return
	}

	c.JSON(http.StatusOK, table)
}

func DeleteTable(c *gin.Context) {
	id := c.Param("id")
	var table models.Table
	if err := database.DB.First(&table, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Table not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch table"})
		return
	}

	// Check if table has open orders before deleting
	var openOrders []models.Order
	if err := database.DB.Where("table_id = ? AND status = ?", table.ID, "open").Find(&openOrders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check for open orders"})
		return
	}

	if len(openOrders) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete table with open orders"})
		return
	}

	if err := database.DB.Delete(&table).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete table"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Table deleted successfully"})
}

func GetAvailableTables(c *gin.Context) {
	var tables []models.Table
	if err := database.DB.Find(&tables).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tables"})
		return
	}

	var availableTables []models.Table
	for _, table := range tables {
		if table.SingleTab {
			var openOrder models.Order
			err := database.DB.Where("table_id = ? AND status = ?", table.ID, "open").First(&openOrder).Error
			if err == gorm.ErrRecordNotFound {
				availableTables = append(availableTables, table)
			}
		} else {
			availableTables = append(availableTables, table)
		}
	}

	c.JSON(http.StatusOK, availableTables)
}
