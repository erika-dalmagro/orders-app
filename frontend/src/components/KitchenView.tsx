import { useState, useEffect } from "react";
import axios from "axios";
import type { Order } from "../types";
import toast from "react-hot-toast";

const KITCHEN_STATUS = {
  WAITING: "Waiting",
  PREPARING: "Preparing",
  READY: "Ready",
};

export default function KitchenView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKitchenOrders = () => {
    axios
      .get("http://localhost:8080/kitchen/orders")
      .then((res) => {
        setOrders(res.data);
      })
      .catch(() => {
        toast.error("Failed to load kitchen orders.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKitchenOrders();
    // Refresh orders every 15 seconds
    const interval = setInterval(fetchKitchenOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await axios.put(
        `http://localhost:8080/orders/${orderId}/kitchen-status`,
        {
          status: newStatus,
        },
      );
      toast.success(`Order moved to "${newStatus}"`);
      fetchKitchenOrders();
    } catch (error) {
      toast.error("Failed to update order status.");
    }
  };

  const filterOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.kitchen_status === status);
  };

  if (loading) {
    return <div>Loading kitchen orders...</div>;
  }

  const waitingOrders = filterOrdersByStatus(KITCHEN_STATUS.WAITING);
  const preparingOrders = filterOrdersByStatus(KITCHEN_STATUS.PREPARING);
  const readyOrders = filterOrdersByStatus(KITCHEN_STATUS.READY);

  return (
    <div className="border p-6 rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Kitchen</h2>
      <p className="text-gray-600 mb-6">View of orders for preparation</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-400">
          <h3 className="font-bold text-lg text-gray-800 mb-2">
            🕒 Waiting for Preparation
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {waitingOrders.length} orders in queue
          </p>
          {waitingOrders.length === 0 ? (
            <p className="text-gray-500">No orders waiting</p>
          ) : (
            waitingOrders.map((order) => (
              <div key={order.id} className="bg-white p-3 rounded shadow mb-3">
                <p className="font-semibold">Table: {order.table?.name}</p>
                <ul className="list-disc list-inside text-sm mt-1">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity}x {item.product?.name}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() =>
                    handleUpdateStatus(order.id, KITCHEN_STATUS.PREPARING)
                  }
                  className="mt-3 w-full bg-orange-500 text-white py-1 rounded hover:bg-orange-600"
                >
                  Start Preparation
                </button>
              </div>
            ))
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-400">
          <h3 className="font-bold text-lg text-gray-800 mb-2">
            🍳 In Preparation
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {preparingOrders.length} orders being prepared
          </p>
          {preparingOrders.length === 0 ? (
            <p className="text-gray-500">No orders in preparation</p>
          ) : (
            preparingOrders.map((order) => (
              <div key={order.id} className="bg-white p-3 rounded shadow mb-3">
                <p className="font-semibold">Table: {order.table?.name}</p>
                <ul className="list-disc list-inside text-sm mt-1">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity}x {item.product?.name}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() =>
                    handleUpdateStatus(order.id, KITCHEN_STATUS.READY)
                  }
                  className="mt-3 w-full bg-red-500 text-white py-1 rounded hover:bg-red-600"
                >
                  Finish
                </button>
              </div>
            ))
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-400">
          <h3 className="font-bold text-lg text-gray-800 mb-2">
            ✅ Ready to Serve
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {readyOrders.length} orders ready
          </p>
          {readyOrders.length === 0 ? (
            <p className="text-gray-500">No orders ready</p>
          ) : (
            readyOrders.map((order) => (
              <div key={order.id} className="bg-white p-3 rounded shadow mb-3">
                <p className="font-semibold">Table: {order.table?.name}</p>
                <ul className="list-disc list-inside text-sm mt-1">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity}x {item.product?.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
