import React, {useState} from "react";
import {SafeAreaView, ScrollView, StyleSheet, View} from "react-native";
import CreateOrderForm from "../components/CreateOrderForm";
import OrderList from "../components/OrderList";
import EditOrderModal from "../components/EditOrderModal";
import {Order} from "../types";

export default function OrderScreen() {
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const handleOrderCreated = () => {
    setRefreshFlag(prev => !prev);
  };

  const handleOpenEditModal = (order: Order) => {
    setEditingOrder(order);
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditingOrder(null);
    setIsEditModalVisible(false);
  };

  const handleOrderUpdated = () => {
    handleCloseEditModal();
    setRefreshFlag(prev => !prev);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View>
          <CreateOrderForm onOrderCreated={handleOrderCreated} />
        </View>
        <OrderList
          shouldRefresh={refreshFlag}
          onEditOrder={handleOpenEditModal}
        />
      </ScrollView>

      <EditOrderModal
        visible={isEditModalVisible}
        order={editingOrder}
        onClose={handleCloseEditModal}
        onOrderUpdated={handleOrderUpdated}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
});
