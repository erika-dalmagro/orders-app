import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { Button, Card, IconButton, Modal, Portal, Text, TextInput, Menu } from "react-native-paper";
import axios from "axios";
import { Order, Product, Table, OrderItem } from "../../types";
import Toast from "react-native-toast-message";
import { theme } from "../../styles/theme";
import { formatDate } from "../../utils/date";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface EditOrderModalProps {
  order: Order | null;
  visible: boolean;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export default function EditOrderModal({ order, visible, onClose, onOrderUpdated }: EditOrderModalProps) {
  const [selectedTableId, setSelectedTableId] = useState<number | string>("");
  const [items, setItems] = useState<Partial<OrderItem>[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [orderDate, setOrderDate] = useState<string>("");

  const [tableMenuVisible, setTableMenuVisible] = useState(false);
  const [itemMenuVisible, setItemMenuVisible] = useState<number | null>(null);

  useEffect(() => {
    if (order) {
      axios.get(`${API_URL}/products`).then((res) => setProducts(res.data || []));
      loadTablesForEdit(order.table_id);

      setSelectedTableId(order.table_id);
      setItems(order.items);
      setOrderDate(new Date(order.date).toISOString().split("T")[0]);
    }
  }, [order]);

  const loadTablesForEdit = (currentTableId: number) => {
    Promise.all([axios.get(`${API_URL}/tables`), axios.get(`${API_URL}/tables/available`)])
      .then(([allTablesRes, availableTablesRes]) => {
        const allTables: Table[] = allTablesRes.data || [];
        const currentAvailable: Table[] = availableTablesRes.data || [];
        const currentOrderTable = allTables.find((t) => t.id === currentTableId);

        const combinedTables = [...currentAvailable];
        if (currentOrderTable && !currentAvailable.some((t) => t.id === currentTableId)) {
          combinedTables.push(currentOrderTable);
        }
        setAvailableTables(combinedTables);
      })
      .catch(() => Alert.alert("Error", "Failed to load tables for editing."));
  };

  if (!order) return null;

  const handleUpdateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...items];
    const itemToUpdate = { ...updatedItems[index] };

    if (field === "product_id") {
      const isProductAlreadyAdded = items.some((item, i) => i !== index && item.product_id === value);
      if (isProductAlreadyAdded) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "This product is already in the order.",
        });
        return;
      }
    }

    (itemToUpdate as any)[field] = value;

    const product = products.find((p) => p.id === itemToUpdate.product_id);

    if (product && itemToUpdate.quantity && itemToUpdate.quantity > product.stock) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Only ${product.stock} items in stock for ${product.name}.`,
      });
      itemToUpdate.quantity = product.stock;
    }

    updatedItems[index] = itemToUpdate;
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    if (products.length > 0) {
      const availableProducts = products.filter((p) => !items.some((item) => item.product_id === p.id));

      if (availableProducts.length === 0) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "All available products have been added.",
        });
        return;
      }

      setItems([...items, { product_id: availableProducts[0].id, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`${API_URL}/orders/${order.id}`, {
        table_id: selectedTableId,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        date: orderDate,
      });
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Order updated successfully!",
      });
      onOrderUpdated();
    } catch (err: any) {
      const message = err.response?.data?.error || "Error updating order";
      Toast.show({ type: "error", text1: "Error", text2: message });
    }
  };

  const selectedTableName = availableTables.find((t) => t.id === selectedTableId)?.name || "Select a table";

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
        <Card style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>
            Edit Order:
          </Text>
          <ScrollView style={{ maxHeight: "80%" }}>
            <Card.Content>
              <Menu
                visible={tableMenuVisible}
                onDismiss={() => setTableMenuVisible(false)}
                anchor={
                  <Button icon="chevron-down" mode="outlined" onPress={() => setTableMenuVisible(true)}>
                    {selectedTableName}
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
                    title={table.name}
                  />
                ))}
              </Menu>

              <TextInput label="Date" value={formatDate(orderDate)} editable={false} style={styles.input} />

              <View style={styles.itemsHeader}>
                <Text variant="bodyLarge" style={styles.label}>
                  Items
                </Text>
                <Button mode="contained-tonal" icon="plus" onPress={handleAddItem}>
                  Add Product
                </Button>
              </View>

              {items.map((item, index) => {
                const selectedProductName =
                  products.find((p) => p.id === item.product_id)?.name ?? "Select Product";
                return (
                  <View key={index} style={styles.itemRow}>
                    <Menu
                      visible={itemMenuVisible === index}
                      onDismiss={() => setItemMenuVisible(null)}
                      anchor={
                        <Button
                          style={{ flex: 1 }}
                          mode="outlined"
                          icon="chevron-down"
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
                            handleUpdateItem(index, "product_id", p.id);
                            setItemMenuVisible(null);
                          }}
                          title={p.name}
                        />
                      ))}
                    </Menu>

                    <TextInput
                      style={styles.quantityInput}
                      value={String(item.quantity)}
                      onChangeText={(t) => handleUpdateItem(index, "quantity", parseInt(t) || 1)}
                      keyboardType="number-pad"
                      mode="outlined"
                      dense
                    />
                    <IconButton
                      icon="close"
                      mode="contained"
                      iconColor="white"
                      containerColor="red"
                      onPress={() => handleRemoveItem(index)}
                    />
                  </View>
                );
              })}
            </Card.Content>
          </ScrollView>
          <Card.Actions>
            <Button onPress={onClose}>Cancel</Button>
            <Button onPress={handleSubmit}>Save Changes</Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  title: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    marginTop: 15,
    marginBottom: 12,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
    gap: 10,
  },
  quantityInput: {
    width: 70,
    height: 40,
    textAlign: "center",
  },
});
