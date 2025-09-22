import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { View, StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Text,
  MD2Colors,
} from "react-native-paper";
import axios from "axios";
import { Order } from "../types";
import ConfirmDialog from "./ConfirmDialog";
import { theme } from "../styles/theme";

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
    return <ActivityIndicator animating={true} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Orders
      </Text>
      {orders.map((order) => (
        <Card key={order.id} style={styles.container}>
          <Card.Title
            title={`Table: ${order.table?.name || `#${order.table_id}`}`}
            subtitle={order.status.toUpperCase()}
            subtitleStyle={
              order.status === "open"
                ? styles.statusOpen
                : styles.statusClosed
            }
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
              <Button style={styles.editButton} onPress={() => onEditOrder(order)}>
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
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  title: {
    marginBottom: theme.spacing.md,
    textAlign: "center",
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
    color: "black",
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