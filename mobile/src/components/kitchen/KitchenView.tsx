import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from "react-native";
import { Button, Card, Text, MD2Colors } from "react-native-paper";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Order } from "../../types";
import { theme } from "../../styles/theme";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const KITCHEN_STATUS = {
  WAITING: "Waiting",
  PREPARING: "Preparing",
  READY: "Ready",
};

export default function KitchenView() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKitchenOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/kitchen/orders`);
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to fetch kitchen orders:", err);
      setOrders([]);
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("failedToLoadKitchen"),
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      fetchKitchenOrders();

      const intervalId = setInterval(fetchKitchenOrders, 15000);

      return () => clearInterval(intervalId);
    }, [fetchKitchenOrders]),
  );

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}/kitchen-status`, {
        status: newStatus,
      });

      let translatedStatusKey = "";
      if (newStatus === KITCHEN_STATUS.PREPARING) {
        translatedStatusKey = "inPreparation";
      } else if (newStatus === KITCHEN_STATUS.READY) {
        translatedStatusKey = "readyToServe";
      } else {
        translatedStatusKey = newStatus.toLowerCase(); // Fallback
      }
      const translatedStatus = t(translatedStatusKey);

      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("orderMovedTo", { status: translatedStatus }),
      });

      fetchKitchenOrders();
    } catch (error: any) {
      const message = error.response?.data?.error || t("failedToUpdateStatus");
      Toast.show({ type: "error", text1: t("error"), text2: message });
      console.error("Failed to update status:", error);
    }
  };

  const filterOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.kitchen_status === status);
  };

  if (loading && orders.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>{t("loadingKitchen")}</Text>
      </View>
    );
  }

  const waitingOrders = filterOrdersByStatus(KITCHEN_STATUS.WAITING);
  const preparingOrders = filterOrdersByStatus(KITCHEN_STATUS.PREPARING);
  const readyOrders = filterOrdersByStatus(KITCHEN_STATUS.READY);

  const renderOrderCard = (order: Order, actionButton?: React.ReactNode) => (
    <Card key={order.id} style={[styles.cardContainer, styles.container]}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.cardTitle}>
          {t("tableLabel")} {order.table?.name || `#${order.table_id}`}
        </Text>
        {order.items.map((item, i) => (
          <Text key={`${order.id}-${item.id || i}`} style={styles.itemText}>
            - {item.quantity}x {item.product?.name}
          </Text>
        ))}
      </Card.Content>
      {actionButton && <Card.Actions>{actionButton}</Card.Actions>}
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
          {t("kitchenViewTitle")}
        </Text>
        <Text style={styles.subtitle}>{t("kitchenViewSubtitle")}</Text>

        {/* Waiting */}
        <View style={[styles.column, { borderColor: MD2Colors.orange400 }]}>
          <Text style={styles.columnTitle}>🕒 {t("waitingForPreparation")}</Text>
          <Text style={styles.columnSubtitle}>{t("ordersInQueue", { count: waitingOrders.length })}</Text>
          {waitingOrders.length === 0 ? (
            <Text style={styles.noOrdersText}>{t("noOrdersWaiting")}</Text>
          ) : (
            waitingOrders.map((order) =>
              renderOrderCard(
                order,
                <Button
                  mode="contained"
                  style={{ backgroundColor: MD2Colors.orange500 }}
                  onPress={() => handleUpdateStatus(order.id, KITCHEN_STATUS.PREPARING)}
                >
                  {t("startPreparation")}
                </Button>,
              ),
            )
          )}
        </View>

        {/* Preparing */}
        <View style={[styles.column, { borderColor: MD2Colors.red400 }]}>
          <Text style={styles.columnTitle}>🍳 {t("inPreparation")}</Text>
          <Text style={styles.columnSubtitle}>
            {t("ordersBeingPrepared", { count: preparingOrders.length })}
          </Text>
          {preparingOrders.length === 0 ? (
            <Text style={styles.noOrdersText}>{t("noOrdersInPreparation")}</Text>
          ) : (
            preparingOrders.map((order) =>
              renderOrderCard(
                order,
                <Button
                  mode="contained"
                  style={{ backgroundColor: MD2Colors.red500 }}
                  onPress={() => handleUpdateStatus(order.id, KITCHEN_STATUS.READY)}
                >
                  {t("finish")}
                </Button>,
              ),
            )
          )}
        </View>

        {/* Ready */}
        <View style={[styles.column, { borderColor: MD2Colors.green400 }]}>
          <Text style={styles.columnTitle}>✅ {t("readyToServe")}</Text>
          <Text style={styles.columnSubtitle}>{t("ordersReady", { count: readyOrders.length })}</Text>
          {readyOrders.length === 0 ? (
            <Text style={styles.noOrdersText}>{t("noOrdersReady")}</Text>
          ) : (
            readyOrders.map((order) => renderOrderCard(order))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  cardContainer: {
    marginVertical: theme.spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  column: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderLeftWidth: 5,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  columnSubtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: theme.spacing.xs,
  },
  itemText: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginLeft: theme.spacing.sm,
  },
  noOrdersText: {
    textAlign: "center",
    color: theme.colors.muted,
    marginVertical: theme.spacing.md,
  },
});
