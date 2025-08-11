import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { Product, Table, OrderItem } from "../types";
import Toast from "react-native-toast-message";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface CreateOrderFormProps {
  onOrderCreated: () => void;
}

export default function CreateOrderForm({ onOrderCreated }: CreateOrderFormProps) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedItems, setSelectedItems] = useState<Partial<OrderItem>[]>([]);

  const [selectedTableId, setSelectedTableId] = useState<number | string>("");

  useEffect(() => {
    Promise.all([axios.get(`${API_URL}/products`), axios.get(`${API_URL}/tables/available`)])
      .then(([productsRes, tablesRes]) => {
        setProducts(productsRes.data || []);
        const availableTables = tablesRes.data || [];
        setTables(availableTables);

        if (availableTables.length > 0) {
          setSelectedTableId(availableTables[0].id);
        } else {
          setSelectedTableId("");
        }
      })
      .catch((err) => {
        console.error(err);
        Alert.alert("Error", "Failed to load initial data. Make sure the server is running.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const loadAvailableTables = () => {
    axios
      .get(`${API_URL}/tables/available`)
      .then((res) => {
        const availableTables = res.data || [];
        setTables(availableTables);
        if (availableTables.length > 0) {
          setSelectedTableId(availableTables[0].id);
        } else {
          setSelectedTableId("");
        }
      })
      .catch(() => Alert.alert("Error", "Failed to refresh available tables."));
  };

  const addItem = () => {
    if (products?.length === 0) {
      Alert.alert("Error", "Products not loaded yet.");
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
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select a table.",
      });
      return;
    }
    if (selectedItems.length === 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please add at least one item.",
      });
      return;
    }

    try {
      const orderDate = new Date().toISOString().split("T")[0];

      await axios.post(`${API_URL}/orders`, {
        table_id: selectedTableId,
        items: selectedItems,
        date: orderDate,
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Order created successfully!",
      });
      setSelectedItems([]);
      loadAvailableTables();
      onOrderCreated();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Error creating order";
      Toast.show({ type: "error", text1: "Error", text2: errorMessage });
      console.error(err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading form...</Text>
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
            enabled={tables.length > 0}
          >
            {tables.length === 0 && <Picker.Item label="No tables available" value="" />}
            {tables.map((table) => (
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
