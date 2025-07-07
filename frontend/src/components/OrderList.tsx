import { useEffect, useState } from "react";
import axios from "axios";
import type { Order } from "../types";

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = () => {
    axios
      .get("http://localhost:8080/orders")
      .then((res) => setOrders(res.data));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const closeOrder = async (id: number) => {
    await axios.put(`http://localhost:8080/orders/${id}/close`);
    loadOrders();
  };

  const handleEditOrder = (order: Order) => {
    // Future modal logic...
    alert(`Editing Order for Table #${order.table_number}. ID: ${order.id}`);
  };

  const handleDeleteOrder = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this order? This will also delete its items.")) {
      try {
        await axios.delete(`http://localhost:8080/orders/${id}`);
        loadOrders();
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Error deleting order. Check console for details.");
      }
    }
  };


  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Orders</h2> 
      {orders.map((order) => (
        <div key={order.id} className="border p-4 mb-3 rounded shadow"> 
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">
              Table #{order.table_number} —{" "} 
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
