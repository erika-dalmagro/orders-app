import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { Button, Card, IconButton, Menu, Text, TextInput, MD2Colors } from "react-native-paper";
import Toast from "react-native-toast-message";
import axios from "axios";
import { Order, OrderItem, Product, Table } from "../../types";
import { useData } from "../../contexts/DataContext";
import EditOrderModal from "./EditOrderModal";
import ConfirmDialog from "../shared/ConfirmDialog";
import { theme } from "../../styles/theme";
import { useTranslation } from "react-i18next";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const KITCHEN_STATUS = {
  WAITING: "Waiting",
  PREPARING: "Preparing",
  READY: "Ready",
  SERVED: "Served",
};

export default function OrderManager() {
  const { t } = useTranslation();
  const { products, availableTables, orders, loading, refreshAll } = useData();

  const [selectedItems, setSelectedItems] = useState<Partial<OrderItem>[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [tableMenuVisible, setTableMenuVisible] = useState(false);
  const [itemMenuVisible, setItemMenuVisible] = useState<number | null>(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [orderIdToDelete, setOrderIdToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (availableTables.length > 0 && !loading) {
      setSelectedTableId(availableTables[0].id);
    } else {
      setSelectedTableId(null);
    }
  }, [availableTables, loading]);

  const addItem = () => {
    if (products?.length === 0) {
      Toast.show({ type: "info", text1: t("noProductsAvailable") });
      return;
    }

    const availableProducts = products.filter((p) => !selectedItems.some((item) => item.product_id === p.id));

    if (availableProducts.length === 0) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("allProductsAddedError")
      });
      return;
    }

    const productToAdd = availableProducts[0];
     if (productToAdd.stock < 1) {
       Toast.show({
         type: "error",
         text1: t("error"),
         text2: t("outOfStockError", { productName: productToAdd.name }),
       });
       return;
     }

    setSelectedItems([...selectedItems, { product_id: productToAdd.id, quantity: 1 }]);
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...selectedItems];
    const itemToUpdate = { ...updated[index] };

    if (field === "product_id") {
      const isProductAlreadyAdded = selectedItems.some((item, i) => i !== index && item.product_id === value);
      if (isProductAlreadyAdded) {
        Toast.show({
          type: "error",
          text1: t("error"),
          text2: t("productAlreadyAddedError")
        });
        return;
      }
    }

    (itemToUpdate as any)[field] = value;

    const product = products.find((p) => p.id === itemToUpdate.product_id);

    if (product && itemToUpdate.quantity && itemToUpdate.quantity > product.stock) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("insufficientStockError", { stock: product.stock, productName: product.name }),
      });
      itemToUpdate.quantity = product.stock;
    }

    updated[index] = itemToUpdate;
    setSelectedItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = [...selectedItems];
    updated.splice(index, 1);
    setSelectedItems(updated);
  };

  const handleSubmit = async () => {
    if (!selectedTableId) {
      Toast.show({ type: "error", text1: t("error"), text2: t("selectTablePrompt") });
      return;
    }
    if (selectedItems.length === 0) {
      Toast.show({ type: "error", text1: t("error"), text2: t("addOneItemPrompt") });
      return;
    }

    try {
      const orderDate = new Date().toISOString().split("T")[0];

      await axios.post(`${API_URL}/orders`, {
        table_id: selectedTableId,
        items: selectedItems,
        date: orderDate,
      });

      Toast.show({ type: "success", text1: t("success"), text2: t("orderCreatedSuccess") });
      setSelectedItems([]);
      
      if (availableTables.length > 0) {
          setSelectedTableId(availableTables[0].id);
      } else {
          setSelectedTableId(null);
      }
      refreshAll();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || t("errorCreatingOrder");
      Toast.show({ type: "error", text1: t("error"), text2: errorMessage });
      console.error(err);
    }
  };

  const closeOrder = async (id: number) => {
    try {
      await axios.put(`${API_URL}/orders/${id}/close`);
      Toast.show({ type: "success", text1: t("success"), text2: t("orderClosedSuccess") });
      refreshAll();
    } catch (error: any) {
      const message = error.response?.data?.error || t("errorClosingOrder");
      Toast.show({ type: "error", text1: t("error"), text2: message });
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsEditModalVisible(true);
  };

  const handleDeleteOrder = (id: number) => {
    setOrderIdToDelete(id);
    setIsDialogVisible(true);
  };

  const handleServeOrder = async (id: number) => {
      try {
        await axios.put(`${API_URL}/orders/${id}/kitchen-status`, {
          status: KITCHEN_STATUS.SERVED, 
        });
        Toast.show({ type: "success", text1: t("success"), text2: t("orderServedSuccess") });
        refreshAll();
      } catch (error: any) {
        const message = error.response?.data?.error || t("errorServingOrder");
        Toast.show({ type: "error", text1: t("error"), text2: message });
      }
  };

  const handleConfirmDelete = async () => {
    if (orderIdToDelete === null) return;
    try {
      await axios.delete(`${API_URL}/orders/${orderIdToDelete}`);
      Toast.show({ type: "success", text1: t("success"), text2: t("orderDeletedSuccess") });
      refreshAll();
    } catch (error: any) {
      const message = error.response?.data?.error || t("errorDeletingOrder");
      Toast.show({ type: "error", text1: t("error"), text2: message });
    } finally {
      setIsDialogVisible(false);
      setOrderIdToDelete(null);
    }
  };

  const handleOrderUpdated = () => {
    setIsEditModalVisible(false);
    setEditingOrder(null);
    refreshAll();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>{t("loadingFormData")}</Text>
      </View>
    );
  }

  const selectedTableName = availableTables.find((t) => t.id === selectedTableId)?.name || t("selectTable");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>
            {t("orderManager")}
          </Text>
          <Card style={styles.container}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.label}>
                {t("tableLabel")}
              </Text>
              <Menu
                visible={tableMenuVisible}
                onDismiss={() => setTableMenuVisible(false)}
                anchor={
                  <Button
                    icon="chevron-down"
                    mode="outlined"
                    onPress={() => setTableMenuVisible(true)}
                    disabled={availableTables.length === 0}
                  >
                    {availableTables.length === 0 ? t("noTablesAvailable") : selectedTableName}
                  </Button>
                }
              >
                {availableTables.map((table) => (
                  <Menu.Item
                    key={table.id}
                    onPress={() => {
                      setSelectedTableId(table.id);
                      setTableMenuVisible(false);
                    }}
                    title={`${table.name} ${t("capacityLabel", { capacity: table.capacity })}`}
                  />
                ))}
              </Menu>

              <View style={styles.itemsHeader}>
                <Text variant="bodyLarge" style={styles.label}>
                  {t("products")}
                </Text>
                <Button mode="contained-tonal" icon="plus" onPress={addItem} disabled={products.length === 0}>
                  {t("addProduct")}
                </Button>
              </View>

              <ScrollView style={styles.scrollView}>
                {selectedItems.map((item, index) => {
                  const selectedProductName =
                    products.find((p) => p.id === item.product_id)?.name || t("selectProduct");
                  return (
                    <View key={index} style={styles.itemRow}>
                      {/* Product Selector */}
                      <Menu
                        visible={itemMenuVisible === index}
                        onDismiss={() => setItemMenuVisible(null)}
                        anchor={
                          <Button
                            style={{ flex: 1 }}
                            icon="chevron-down"
                            mode="outlined"
                            onPress={() => setItemMenuVisible(index)}
                          >
                            {selectedProductName}
                          </Button>
                        }
                      >
                        {products.map((p) => (
                          <Menu.Item
                            key={p.id}
                            onPress={() => {
                              updateItem(index, "product_id", p.id);
                              setItemMenuVisible(null);
                            }}
                            title={`${p.name} ${t("stockLabel", { stock: p.stock })}`}
                          />
                        ))}
                      </Menu>

                      <TextInput
                        style={styles.quantityInput}
                        value={String(item.quantity || 1)}
                        onChangeText={(text) => updateItem(index, "quantity", parseInt(text) || 1)}
                        keyboardType="number-pad"
                        mode="outlined"
                        dense
                      />
                      <IconButton
                        icon="close"
                        mode="contained"
                        iconColor="white"
                        containerColor="red"
                        onPress={() => removeItem(index)}
                      />
                    </View>
                  );
                })}
              </ScrollView>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={handleSubmit}
                disabled={!selectedTableId || selectedItems.length === 0}
                style={styles.createButton}
              >
                {t("createOrder")}
              </Button>
            </Card.Actions>
          </Card>
        </View>

        <View style={styles.container}>
          <Text variant="titleLarge" style={styles.title}>
            {t("ordersTitle")}
          </Text>
          {loading ? (
            <ActivityIndicator animating={true} size="large" />
          ) : (
            orders.map((order) => (
              <Card key={order.id} style={[styles.cardContainer, styles.container]}>
                <Card.Title
                  title={`${t("tableLabel")} ${order.table?.name || `#${order.table_id}`}`}
                  subtitle={`${t(order.status === "open" ? "openStatus" : "closedStatus")} - ${order.kitchen_status || 'N/A'}`}
                  subtitleStyle={order.status === "open" ? styles.statusOpen : styles.statusClosed}
                />
                <Card.Content>
                  {order.items.map((item, i) => (
                    <Text key={i} style={styles.itemText}>
                      - {item.product?.name} x {item.quantity}
                    </Text>
                  ))}
                </Card.Content>
                <Card.Actions>
                  {order.status === "open" && (
                    <Button style={styles.editButton} onPress={() => handleEditOrder(order)}>
                      <Text style={styles.buttonText}>{t("edit")}</Text>
                    </Button>
                  )}
                  {order.status === "open" && order.kitchen_status === KITCHEN_STATUS.READY && (
                     <Button style={styles.serveButton} onPress={() => handleServeOrder(order.id)}>
                        <Text style={styles.buttonText}>{t("markAsServed")}</Text>
                     </Button>
                   )}
                  {order.status === "open" && (
                    <Button style={styles.closeButton} onPress={() => closeOrder(order.id)}>
                      <Text style={styles.buttonText}>{t("closeOrder")}</Text>
                    </Button>
                  )}
                  <Button style={styles.deleteButton} onPress={() => handleDeleteOrder(order.id)}>
                    <Text style={styles.buttonText}>{t("delete")}</Text>
                  </Button>
                </Card.Actions>
              </Card>
            ))
          )}
          <ConfirmDialog
            visible={isDialogVisible}
            title={t("confirmDeleteOrderTitle")}
            message={t("confirmDeleteOrderMessage")}
            onCancel={() => setIsDialogVisible(false)}
            onConfirm={handleConfirmDelete}
            confirmText={t("delete")}
          />
        </View>

        <EditOrderModal
          visible={isEditModalVisible}
          order={editingOrder}
          onClose={() => setIsEditModalVisible(false)}
          onOrderUpdated={handleOrderUpdated}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  cardContainer: {
    marginVertical: theme.spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    marginBottom: 10,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  scrollView: {
    marginTop: 20,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  quantityInput: {
    width: 70,
    height: 40,
    textAlign: "center",
  },
  createButton: {
    flex: 1,
    margin: 8,
  },
  statusOpen: {
    color: MD2Colors.green800,
  },
  statusClosed: {
    color: MD2Colors.grey600,
  },
  buttonText: {
    color: "white",
  },
  editButton: {
    borderWidth: 0,
    backgroundColor: "#ffc107",
  },
  closeButton: {
    backgroundColor: "#17a2b8",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  serveButton: {
     backgroundColor: "#28a745",
   },
  itemText: {
    marginBottom: theme.spacing.xs,
  },
});
