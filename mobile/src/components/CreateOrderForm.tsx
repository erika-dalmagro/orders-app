import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  IconButton,
  Menu,
  Text,
  TextInput,
} from "react-native-paper";
import Toast from "react-native-toast-message";
import axios from "axios";
import { OrderItem } from "../types";
import { useProducts } from "../context/ProductContext";
import { useTables } from "../context/TableContext";
import { theme } from "../styles/theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface CreateOrderFormProps {
  onOrderCreated: () => void;
}

export default function CreateOrderForm({ onOrderCreated }: CreateOrderFormProps) {
  const { products, loading: productsLoading } = useProducts();
  const { availableTables, loading: tablesLoading, loadTables } = useTables();

  const [selectedItems, setSelectedItems] = useState<Partial<OrderItem>[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [tableMenuVisible, setTableMenuVisible] = useState(false);
  const [itemMenuVisible, setItemMenuVisible] = useState<number | null>(null);

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
      onOrderCreated();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Error creating order";
      Toast.show({ type: "error", text1: "Error", text2: errorMessage });
      console.error(err);
    }
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
              title={`${table.name} (Cap: ${table.capacity})`}
            />
          ))}
        </Menu>

        <View style={styles.itemsHeader}>
          <Text variant="bodyLarge" style={styles.label}>
            Items
          </Text>
          <Button
            mode="contained-tonal"
            icon="plus"
            onPress={addItem}
            disabled={products.length === 0}
          >
            Add Product
          </Button>
        </View>

        <ScrollView>
          {selectedItems.map((item, index) => {
            const selectedProductName = products.find((p) => p.id === item.product_id)?.name || "Select Product";
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
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
    marginTop: 15,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
    textAlign: "center",
  },
  createButton: {
    flex: 1,
    margin: 8,
  },
});