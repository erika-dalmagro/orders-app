package controllers

import (
	"net/http"

	"github.com/erika-dalmagro/orders-backend/database"
	"github.com/erika-dalmagro/orders-backend/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func CreateTable(c *gin.Context) {
	var table models.Table
	if err := c.ShouldBindJSON(&table); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
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

	var reqTable struct {
		Name     string `json:"name" binding:"required"`
		Capacity int    `json:"capacity" binding:"required,gt=0"`
	}

	if err := c.ShouldBindJSON(&reqTable); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	table.Name = reqTable.Name
	table.Capacity = reqTable.Capacity

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
	var occupiedTableIDs []uint

	database.DB.Model(&models.Order{}).
		Where("status = ?", "open").
		Pluck("table_id", &occupiedTableIDs)

	if len(occupiedTableIDs) > 0 {
		database.DB.Where("id NOT IN (?)", occupiedTableIDs).Find(&tables)
	} else {
		database.DB.Find(&tables)
	}

	c.JSON(http.StatusOK, tables)
}