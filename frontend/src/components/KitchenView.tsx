import { useState, useEffect } from "react";
import axios from "axios";
import type { Order } from "../types";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const KITCHEN_STATUS = {
  WAITING: "Waiting",
  PREPARING: "Preparing",
  READY: "Ready",
};

export default function KitchenView() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchKitchenOrders = () => {
    axios
      .get("http://localhost:8080/kitchen/orders")
      .then((res) => {
        setOrders(res.data);
      })
      .catch(() => {
        toast.error(t("failedToLoadKitchen"));
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
      const translatedStatus = t(newStatus.toLowerCase());
      toast.success(t("orderMovedTo", { status: translatedStatus }));
      fetchKitchenOrders();
    } catch (error) {
      toast.error(t("failedToUpdateStatus"));
    }
  };

  const filterOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.kitchen_status === status);
  };

  if (loading) {
    return <div>{t('loading')}...</div>;
  }

  const waitingOrders = filterOrdersByStatus(KITCHEN_STATUS.WAITING);
  const preparingOrders = filterOrdersByStatus(KITCHEN_STATUS.PREPARING);
  const readyOrders = filterOrdersByStatus(KITCHEN_STATUS.READY);

  return (
    <div className="border p-6 rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('kitchenViewTitle')}</h2>
      <p className="text-gray-600 mb-6">{t('kitchenViewSubtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-400">
          <h3 className="font-bold text-lg text-gray-800 mb-2">
            🕒 {t('waitingForPreparation')}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {t('ordersInQueue', { count: waitingOrders.length })}
          </p>
          {waitingOrders.length === 0 ? (
            <p className="text-gray-500">{t('noOrdersWaiting')}</p>
          ) : (
            waitingOrders.map((order) => (
              <div key={order.id} className="bg-white p-3 rounded shadow mb-3">
                <p className="font-semibold">{t('tableLabel')} {order.table?.name}</p>
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
                  {t('startPreparation')}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-400">
          <h3 className="font-bold text-lg text-gray-800 mb-2">
            🍳 {t('inPreparation')}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {t('ordersBeingPrepared', { count: preparingOrders.length })}
          </p>
          {preparingOrders.length === 0 ? (
            <p className="text-gray-500">{t('noOrdersInPreparation')}</p>
          ) : (
            preparingOrders.map((order) => (
              <div key={order.id} className="bg-white p-3 rounded shadow mb-3">
                <p className="font-semibold">{t('tableLabel')} {order.table?.name}</p>
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
                  {t('finish')}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-400">
          <h3 className="font-bold text-lg text-gray-800 mb-2">
            ✅ {t('readyToServe')}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {t('ordersReady', { count: readyOrders.length })}
          </p>
          {readyOrders.length === 0 ? (
            <p className="text-gray-500">{t('noOrdersReady')}</p>
          ) : (
            readyOrders.map((order) => (
              <div key={order.id} className="bg-white p-3 rounded shadow mb-3">
                <p className="font-semibold">{t('tableLabel')} {order.table?.name}</p>
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
