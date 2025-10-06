import { useEffect, useState } from "react";
import axios from "axios";
import type { Order } from "../types";
import toast from "react-hot-toast";

interface OrderListProps {
  onEditOrder: (order: Order) => void;
}

export default function OrderList({ onEditOrder }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = () => {
    axios
      .get("http://localhost:8080/orders")
      .then((res) => setOrders(res.data))
      .catch(() => toast.error("Failed to load orders."));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const closeOrder = async (id: number) => {
    try {
      await axios.put(`http://localhost:8080/orders/${id}/close`);
      toast.success("Order closed successfully!");
      loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error closing order.");
    }
  };

  const handleEditOrder = (order: Order) => {
    onEditOrder(order);
  };

  const handleDeleteOrder = async (id: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this order? This will also delete its items.",
      )
    ) {
      try {
        await axios.delete(`http://localhost:8080/orders/${id}`);
        toast.success("Order deleted successfully!");
        loadOrders();
      } catch (error: any) {
        console.error("Error deleting order:", error);
        toast.error(error.response?.data?.error || "Error deleting order.");
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Orders</h2>
      {orders.map((order) => (
        <div key={order.id} className="border p-6 mb-3 rounded shadow">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">
              Table {order.table?.name || `#${order.table_id}`} —{" "}
              <span
                className={
                  order.status === "open" ? "text-green-600" : "text-gray-600"
                }
              >
                {order.status.toUpperCase()}
              </span>
            </h3>
            <div className="flex gap-2">
              {order.status === "open" && (
                <button
                  onClick={() => closeOrder(order.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Close Order
                </button>
              )}
              <button
                onClick={() => handleEditOrder(order)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteOrder(order.id)}
                className="bg-red-700 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
          <ul className="mt-2">
            {order.items.map((item, i) => (
              <li key={i}>
                {item.product?.name} x {item.quantity} — $
                {item.product
                  ? (item.product.price * item.quantity).toFixed(2)
                  : ""}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
