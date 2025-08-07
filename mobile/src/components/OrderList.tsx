import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { Order } from "../types";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface OrderListProps {
  shouldRefresh: boolean;
}

export default function OrderList({ shouldRefresh }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = () => {
    setLoading(true);
    axios
      .get(`${API_URL}/orders`)
      .then((res) => setOrders(res.data))
      .catch(() => Alert.alert("Error", "Failed to load orders."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [shouldRefresh]);

  const closeOrder = async (id: number) => {
    try {
      await axios.put(`${API_URL}/orders/${id}/close`);
      Alert.alert("Success", "Order closed successfully!");
      loadOrders(); // Refresh the list
    } catch (error: any) {
      const message = error.response?.data?.error || "Error closing order.";
      Alert.alert("Error", message);
    }
  };

  const handleDeleteOrder = (id: number) => {
    Alert.alert(
      "Delete Order",
      "Are you sure you want to delete this order? This will also delete its items.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/orders/${id}`);
              Alert.alert("Success", "Order deleted successfully!");
              loadOrders();
            } catch (error: any) {
              const message = error.response?.data?.error || "Error deleting order.";
              Alert.alert("Error", message);
            }
          },
        },
      ]
    );
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
            <Text style={styles.tableName}>
              Table {order.table?.name || `#${order.table_id}`}
            </Text>
            <Text style={order.status === 'open' ? styles.statusOpen : styles.statusClosed}>
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
    </View>
  );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: '#333',
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
        marginBottom: 10,
    },
    tableName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statusOpen: {
        color: 'green',
        fontWeight: 'bold',
    },
    statusClosed: {
        color: 'gray',
        fontWeight: 'bold',
    },
    itemsList: {
        marginBottom: 15,
    },
    itemText: {
        fontSize: 16,
        color: '#333'
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#ffc107',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
    },
});