import { useState } from "react";
import ProductManager from "./components/ProductManager";
import CreateOrderForm from "./components/CreateOrderForm";
import OrderList from "./components/OrderList";
import EditOrderModal from "./components/EditOrderModal";
import type { Order } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"products" | "orders">("orders");
  const [refreshOrders, setRefreshOrders] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const reloadOrders = () => setRefreshOrders(!refreshOrders);

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
  };

  const handleCloseModal = () => {
    setEditingOrder(null);
  };

  const handleOrderUpdated = () => {
    reloadOrders();
    handleCloseModal();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Restaurant System</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded ${
            activeTab === "orders"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-blue-900"
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded ${
            activeTab === "products"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-blue-900"
          }`}
        >
          Products
        </button>
      </div>

      {activeTab === "products" ? (
        <ProductManager />
      ) : (
        <>
          <CreateOrderForm onOrderCreated={reloadOrders} />
          <OrderList
            key={refreshOrders.toString()}
            onEditOrder={handleEditOrder}
          />
        </>
      )}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={handleCloseModal}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </div>
  );
}
