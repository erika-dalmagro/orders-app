import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { ActivityIndicator, Card, Text, MD2Colors } from "react-native-paper";
import { Calendar, DateData } from "react-native-calendars";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Order } from "../../types";
import { theme } from "../../styles/theme";
import { formatDate } from "../../utils/date";
import { useTranslation } from "react-i18next";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const formatDateAPI = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export default function CalendarView() {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(formatDateAPI(new Date()));
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
        text1: t("error"),
        text2: t("failedToLoadOrdersForDate", { date }),
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
      <Text variant="headlineMedium" style={styles.title}>
        {t("calendarTitle")}
      </Text>

      <Card style={styles.card}>
        <Calendar
          style={styles.calendar}
          current={selectedDate}
          onDayPress={onDayPress}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: theme.colors.primary },
          }}
          theme={{
            todayTextColor: theme.colors.primary,
            arrowColor: theme.colors.primary,
          }}
        />
      </Card>

      <View style={styles.container}>
        <Text variant="titleLarge" style={styles.title}>
          {t("ordersForDate", { date: formatDate(selectedDate) })}:
        </Text>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : orders.length === 0 ? (
          <Text style={styles.noOrdersText}>{t("noOrdersForDate")}</Text>
        ) : (
          orders.map((order) => (
            <Card key={order.id} style={[styles.cardContainer, styles.container]}>
              <Card.Title
                title={`${t("tableLabel")} ${order.table?.name || `#${order.table_id}`}`}
                subtitle={t(order.status === "open" ? "openStatus" : "closedStatus")}
                subtitleStyle={order.status === "open" ? styles.statusOpen : styles.statusClosed}
              />
              <Card.Content>
                {order.items.map((item, i) => (
                  <Text key={i} style={styles.itemText}>
                    - {item.product?.name} x {item.quantity}
                  </Text>
                ))}
              </Card.Content>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  cardContainer: {
    marginVertical: theme.spacing.sm,
  },
  title: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  calendar: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  noOrdersText: {
    textAlign: "center",
    color: MD2Colors.grey500,
  },
  statusOpen: {
    color: MD2Colors.green800,
    fontWeight: "bold",
  },
  statusClosed: {
    color: MD2Colors.grey600,
    fontWeight: "bold",
  },
  itemText: {
    marginBottom: theme.spacing.xs,
  },
});
