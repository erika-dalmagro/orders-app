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
            {order.status === "open" && (
              <button
                onClick={() => closeOrder(order.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                {order.table_number}Close Order
              </button>
            )}
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
