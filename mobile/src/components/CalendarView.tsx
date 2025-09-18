import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Order } from "../types";
import { theme } from "../styles/theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrdersForDate = async (date: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders/by-date?date=${date}`);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch orders for date:", err);
      setOrders([]);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Failed to load orders for ${date}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersForDate(selectedDate);
  }, [selectedDate]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Orders Calendar</Text>

      <Calendar
        current={selectedDate}
        onDayPress={onDayPress}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#007bff" },
        }}
        theme={{
          todayTextColor: "#007bff",
          arrowColor: "#007bff",
        }}
        style={styles.calendar}
      />

      <View style={styles.ordersContainer}>
        <Text style={styles.ordersTitle}>Orders for {selectedDate}:</Text>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : orders.length === 0 ? (
          <Text style={styles.noOrdersText}>No orders for this date.</Text>
        ) : (
          orders.map((order) => (
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
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 20,
    color: "#333",
  },
  calendar: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginHorizontal: 10,
  },
  ordersContainer: {
    padding: 20,
  },
  ordersTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  noOrdersText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tableName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusOpen: { color: "green", fontWeight: "bold" },
  statusClosed: { color: "gray", fontWeight: "bold" },
  itemsList: { marginTop: 10 },
  itemText: { fontSize: 16 },
});
