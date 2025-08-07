import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import {Picker} from "@react-native-picker/picker";
import {Order, Product, Table, OrderItem} from "../types";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface EditOrderModalProps {
  order: Order | null;
  visible: boolean;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export default function EditOrderModal({
  order,
  visible,
  onClose,
  onOrderUpdated,
}: EditOrderModalProps) {
  const [selectedTableId, setSelectedTableId] = useState<number | string>("");
  const [items, setItems] = useState<Partial<OrderItem>[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [orderDate, setOrderDate] = useState<string>("");

  useEffect(() => {
    if (order) {
      axios.get(`${API_URL}/products`).then(res => setProducts(res.data || []));
      loadTablesForEdit(order.table_id);

      setSelectedTableId(order.table_id);
      setItems(order.items);
      setOrderDate(new Date(order.date).toISOString().split("T")[0]);
    }
  }, [order]);

  const loadTablesForEdit = (currentTableId: number) => {
    Promise.all([
      axios.get(`${API_URL}/tables`),
      axios.get(`${API_URL}/tables/available`),
    ])
      .then(([allTablesRes, availableTablesRes]) => {
        const allTables: Table[] = allTablesRes.data || [];
        const currentAvailable: Table[] = availableTablesRes.data || [];
        const currentOrderTable = allTables.find(t => t.id === currentTableId);

        const combinedTables = [...currentAvailable];
        if (
          currentOrderTable &&
          !currentAvailable.some(t => t.id === currentTableId)
        ) {
          combinedTables.push(currentOrderTable);
        }
        setAvailableTables(combinedTables);
      })
      .catch(() => Alert.alert("Error", "Failed to load tables for editing."));
  };

  if (!order) return null;

  const handleUpdateItem = (
    index: number,
    field: keyof OrderItem,
    value: any,
  ) => {
    const updatedItems = [...items];
    const itemToUpdate = {...updatedItems[index]};
    (itemToUpdate as any)[field] = value;
    updatedItems[index] = itemToUpdate;
    setItems(updatedItems);
  };
  const handleAddItem = () => {
    if (products.length > 0) {
      setItems([...items, {product_id: products[0].id, quantity: 1}]);
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
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        date: orderDate,
      });
      Alert.alert("Success", "Order updated successfully!");
      onOrderUpdated();
    } catch (err: any) {
      const message = err.response?.data?.error || "Error updating order";
      Alert.alert("Error", message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView>
            <Text style={styles.modalTitle}>Edit Order</Text>

            <Text style={styles.label}>Table:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedTableId}
                onValueChange={itemValue => setSelectedTableId(itemValue)}
              >
                {availableTables.map(table => (
                  <Picker.Item
                    key={table.id}
                    label={table.name}
                    value={table.id}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Date:</Text>
            <TextInput
              style={styles.input}
              value={orderDate}
              editable={false}
            />

            <View style={styles.itemsHeader}>
              <Text style={styles.label}>Items</Text>
              <Button title="+ Add" onPress={handleAddItem} />
            </View>

            {items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={item.product_id}
                    onValueChange={v =>
                      handleUpdateItem(index, "product_id", v)
                    }
                  >
                    {products.map(p => (
                      <Picker.Item key={p.id} label={p.name} value={p.id} />
                    ))}
                  </Picker>
                </View>
                <TextInput
                  style={styles.quantityInput}
                  value={String(item.quantity)}
                  onChangeText={t =>
                    handleUpdateItem(index, "quantity", parseInt(t) || 1)
                  }
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  onPress={() => handleRemoveItem(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.buttonContainer}>
              <Button title="Cancel" onPress={onClose} color="#6c757d" />
              <Button title="Save Changes" onPress={handleSubmit} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "95%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  label: {fontSize: 16, fontWeight: "500", marginBottom: 5, marginTop: 10},
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#e9ecef",
    color: "#495057",
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
    marginTop: 15,
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
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  removeButtonText: {color: "white", fontWeight: "bold"},
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
  },
});
