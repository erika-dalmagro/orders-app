import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { Button, Card, IconButton, Menu, Text, TextInput, MD2Colors } from "react-native-paper";
import Toast from "react-native-toast-message";
import axios from "axios";
import { Order, OrderItem, Product, Table } from "../../types";
import { useProducts } from "../../contexts/ProductContext";
import { useTables } from "../../contexts/TableContext";
import EditOrderModal from "./EditOrderModal";
import ConfirmDialog from "../shared/ConfirmDialog";
import { theme } from "../../styles/theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function OrderManager() {
  const { products, loading: productsLoading } = useProducts();
  const { availableTables, loading: tablesLoading, loadTables } = useTables();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const [selectedItems, setSelectedItems] = useState<Partial<OrderItem>[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [tableMenuVisible, setTableMenuVisible] = useState(false);
  const [itemMenuVisible, setItemMenuVisible] = useState<number | null>(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [orderIdToDelete, setOrderIdToDelete] = useState<number | null>(null);

  const loadOrders = () => {
    setLoading(true);
    axios
      .get(`${API_URL}/orders`)
      .then((res) => setOrders(res.data))
      .catch(() => Toast.show({ type: "error", text1: "Error", text2: "Failed to load orders." }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [shouldRefresh]);

  useEffect(() => {
    if (availableTables.length > 0 && !tablesLoading) {
      setSelectedTableId(availableTables[0].id);
    } else {
      setSelectedTableId(null);
    }
  }, [availableTables, tablesLoading]);

  const addItem = () => {
    if (products?.length === 0) {
      Toast.show({ type: "info", text1: "No products available to add." });
      return;
    }
    setSelectedItems([...selectedItems, { product_id: products[0].id, quantity: 1 }]);
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...selectedItems];
    const itemToUpdate = { ...updated[index] };
    (itemToUpdate as any)[field] = value;
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
      Toast.show({ type: "error", text1: "Error", text2: "Please select a table." });
      return;
    }
    if (selectedItems.length === 0) {
      Toast.show({ type: "error", text1: "Error", text2: "Please add at least one item." });
      return;
    }

    try {
      const orderDate = new Date().toISOString().split("T")[0];

      await axios.post(`${API_URL}/orders`, {
        table_id: selectedTableId,
        items: selectedItems,
        date: orderDate,
      });

      Toast.show({ type: "success", text1: "Success", text2: "Order created successfully!" });
      setSelectedItems([]);
      loadTables();
      setShouldRefresh((prev) => !prev);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Error creating order";
      Toast.show({ type: "error", text1: "Error", text2: errorMessage });
      console.error(err);
    }
  };

  const closeOrder = async (id: number) => {
    try {
      await axios.put(`${API_URL}/orders/${id}/close`);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Order closed successfully!",
      });
      loadOrders();
    } catch (error: any) {
      const message = error.response?.data?.error || "Error closing order.";
      Toast.show({ type: "error", text1: "Error", text2: message });
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

  const handleConfirmDelete = async () => {
    if (orderIdToDelete === null) return;
    try {
      await axios.delete(`${API_URL}/orders/${orderIdToDelete}`);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Order deleted successfully!",
      });
      loadOrders();
    } catch (error: any) {
      const message = error.response?.data?.error || "Error deleting order.";
      Toast.show({ type: "error", text1: "Error", text2: message });
    } finally {
      setIsDialogVisible(false);
      setOrderIdToDelete(null);
    }
  };

  const handleOrderUpdated = () => {
    setIsEditModalVisible(false);
    setEditingOrder(null);
    setShouldRefresh((prev) => !prev);
  };

  if (productsLoading || tablesLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading form data...</Text>
      </View>
    );
  }

  const selectedTableName = availableTables.find((t) => t.id === selectedTableId)?.name || "Select a table";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>
            Order Manager
          </Text>
          <Card style={styles.container}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.label}>
                Table:
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
                    {availableTables.length === 0 ? "No tables available" : selectedTableName}
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
                    title={`${table.name} (Capacity: ${table.capacity})`}
                  />
                ))}
              </Menu>

              <View style={styles.itemsHeader}>
                <Text variant="bodyLarge" style={styles.label}>
                  Products
                </Text>
                <Button mode="contained-tonal" icon="plus" onPress={addItem} disabled={products.length === 0}>
                  Add Product
                </Button>
              </View>

              <ScrollView style={styles.scrollView}>
                {selectedItems.map((item, index) => {
                  const selectedProductName =
                    products.find((p) => p.id === item.product_id)?.name || "Select Product";
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
                            title={`${p.name} (Stock: ${p.stock})`}
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
                Create Order
              </Button>
            </Card.Actions>
          </Card>
        </View>

        <View style={styles.container}>
          <Text variant="titleLarge" style={styles.title}>
            Orders
          </Text>
          {loading ? (
            <ActivityIndicator animating={true} size="large" />
          ) : (
            orders.map((order) => (
              <Card key={order.id} style={[styles.cardContainer, styles.container]}>
                <Card.Title
                  title={`Table: ${order.table?.name || `#${order.table_id}`}`}
                  subtitle={order.status.toUpperCase()}
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
                      <Text style={styles.buttonText}>Edit</Text>
                    </Button>
                  )}
                  {order.status === "open" && (
                    <Button style={styles.closeButton} onPress={() => closeOrder(order.id)}>
                      <Text style={styles.buttonText}>Close Order</Text>
                    </Button>
                  )}
                  <Button style={styles.deleteButton} onPress={() => handleDeleteOrder(order.id)}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </Button>
                </Card.Actions>
              </Card>
            ))
          )}
          <ConfirmDialog
            visible={isDialogVisible}
            title="Delete Order"
            message="Are you sure you want to delete this order? This will also delete its items."
            onCancel={() => setIsDialogVisible(false)}
            onConfirm={handleConfirmDelete}
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
  itemText: {
    marginBottom: theme.spacing.xs,
  },
});
