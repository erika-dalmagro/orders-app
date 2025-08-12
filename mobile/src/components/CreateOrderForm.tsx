import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import axios from "axios";
import { OrderItem } from "../types";
import { useProducts } from "../context/ProductContext";
import { useTables } from "../context/TableContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface CreateOrderFormProps {
  onOrderCreated: () => void;
}

export default function CreateOrderForm({ onOrderCreated }: CreateOrderFormProps) {
  const { products, loading: productsLoading } = useProducts();
  const { availableTables, loading: tablesLoading, loadTables } = useTables();

  const [selectedItems, setSelectedItems] = useState<Partial<OrderItem>[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | string>("");

  useEffect(() => {
    if (availableTables.length > 0 && !tablesLoading) {
      setSelectedTableId(availableTables[0].id);
    } else {
      setSelectedTableId("");
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Manager</Text>

      <View style={styles.formSection}>
        <Text style={styles.label}>Table:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedTableId}
            onValueChange={(itemValue) => setSelectedTableId(itemValue)}
            enabled={availableTables.length > 0}
          >
            {availableTables.length === 0 && <Picker.Item label="No tables available" value="" />}
            {availableTables.map((table) => (
              <Picker.Item key={table.id} label={`${table.name} (Cap: ${table.capacity})`} value={table.id} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.formSection}>
        <View style={styles.itemsHeader}>
          <Text style={styles.label}>Items</Text>
          <Button title="+ Add Product" onPress={addItem} disabled={products.length === 0} />
        </View>

        {selectedItems.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={item.product_id}
                onValueChange={(value) => updateItem(index, "product_id", value)}
              >
                {products.map((p) => (
                  <Picker.Item key={p.id} label={`${p.name} (Stock: ${p.stock})`} value={p.id} />
                ))}
              </Picker>
            </View>
            <TextInput
              style={styles.quantityInput}
              value={String(item.quantity || 1)}
              onChangeText={(text) => updateItem(index, "quantity", parseInt(text) || 1)}
              keyboardType="number-pad"
            />
            <TouchableOpacity onPress={() => removeItem(index)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Button
        title="Create Order"
        onPress={handleSubmit}
        disabled={!selectedTableId || selectedItems.length === 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  formSection: {
    marginBottom: 25,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    flex: 1,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
    width: 60,
    textAlign: "center",
  },
  removeButton: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
