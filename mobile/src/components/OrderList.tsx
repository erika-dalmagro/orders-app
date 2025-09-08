import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import axios from "axios";
import { Order } from "../types";
import ConfirmDialog from "./ConfirmDialog";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface OrderListProps {
  shouldRefresh: boolean;
  onEditOrder: (order: Order) => void;
}

export default function OrderList({ shouldRefresh, onEditOrder }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [orderIdToDelete, setOrderIdToDelete] = useState<number | null>(null);

  const loadOrders = () => {
    setLoading(true);
    axios
      .get(`${API_URL}/orders`)
      .then((res) => setOrders(res.data))
      .catch(() => Toast.show({type: 'error', text1: 'Error', text2: 'Failed to load orders.'}))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [shouldRefresh]);

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

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>
      {orders.map((order) => (
        <View key={order.id} style={styles.orderCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.tableName}>Table {order.table?.name || `#${order.table_id}`}</Text>
            <Text style={order.status === "open" ? styles.statusOpen : styles.statusClosed}>
              {order.status.toUpperCase()}
              </Text>
          </View>

          <View style={styles.itemsList}>
            {order.items.map((item, i) => (
              <Text key={i} style={styles.itemText}>
                - {item.product?.name} x {item.quantity}
              </Text>
            ))}
          </View>

          <View style={styles.actionsContainer}>
            {order.status === "open" && (
              <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => onEditOrder(order)}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
            )}
            {order.status === "open" && (
              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={() => closeOrder(order.id)}
              >
                <Text style={styles.buttonText}>Close Order</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => handleDeleteOrder(order.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <ConfirmDialog
        visible={isDialogVisible}
        title="Delete Order"
        message="Are you sure you want to delete this order? This will also delete its items."
        onCancel={() => setIsDialogVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
    marginBottom: 10,
  },
  tableName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusOpen: {
    color: "green",
    fontWeight: "bold",
  },
  statusClosed: {
    color: "gray",
    fontWeight: "bold",
  },
  itemsList: {
    marginBottom: 15,
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#ffc107",
  },
  closeButton: {
    backgroundColor: "#17a2b8",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
  dialogOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialogContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dialogMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dialogButton: {
    marginLeft: 20,
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  dialogCancelButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  dialogDeleteButtonText: {
    fontSize: 16,
    color: '#dc3545',
  },
  dialogCancelButton: {
    borderColor: '#007bff',
  },
  dialogDeleteButton: {
    borderColor: '#dc3545',
  },
});