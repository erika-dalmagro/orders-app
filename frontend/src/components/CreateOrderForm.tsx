/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import type { Product, OrderItem, Table } from "../types";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function CreateOrderForm({
  onOrderCreated,
}: {
  onOrderCreated: () => void;
}) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [orderDate, setOrderDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8080/products")
      .then((res) => setProducts(res.data))
      .catch((err) => toast.error("Failed to load products."));

    loadAvailableTables();
  }, []);

  const loadAvailableTables = () => {
    axios
      .get("http://localhost:8080/tables/available")
      .then((res) => {
        setTables(res.data);
        if (res.data?.length > 0) {
          setSelectedTableId(res.data[0].id);
        } else {
          setSelectedTableId(null);
        }
      })
      .catch((err) => toast.error("Failed to load available tables."));
  };

  const addItem = () => {
    if (products?.length === 0) {
      toast.error(t("productsNotLoaded"));
      return;
    }

    setSelectedItems([
      ...selectedItems,
      { product_id: products[0].id, quantity: 1 },
    ]);
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...selectedItems];
    updated[index][field] = value;
    setSelectedItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = [...selectedItems];
    updated.splice(index, 1);
    setSelectedItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedTableId) {
      toast.error(t("selectTablePrompt"));
      return;
    }

    if (selectedItems?.length === 0) {
      toast.error(t("addOneItemPrompt"));
      return;
    }

    try {
      await axios.post("http://localhost:8080/orders", {
        table_id: selectedTableId,
        items: selectedItems,
        date: orderDate,
      });

      toast.success(t("orderCreatedSuccess"));
      setSelectedItems([]);
      loadAvailableTables();
      onOrderCreated();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || t("errorCreatingOrder");
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="border p-6 rounded mb-6 shadow">
      <h2 className="text-xl font-bold mb-2">{t('createOrderFormTitle')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 items-center">
          <label htmlFor="tableSelect" className="mr-2 font-medium">
            {t('tableLabel')}
          </label>
          <select
            id="tableSelect"
            value={selectedTableId || ""}
            onChange={(e) => setSelectedTableId(Number(e.target.value))}
            className="border px-2 py-1"
            required
            disabled={tables?.length === 0}
          >
            {tables?.length === 0 && (
              <option value="">{t('noTablesAvailable')}</option>
            )}
            {tables?.map((table) => (
              <option key={table.id} value={table.id}>
                {table.name} {t('capacityLabel', { capacity: table.capacity })}
              </option>
            ))}
          </select>

          <label htmlFor="orderDate" className="mr-2 font-medium">
            {t('dateLabel')}
          </label>
          <input
            type="date"
            id="orderDate"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            className="border px-2 py-1"
            required
          />

          <div>
            <button
              type="button"
              onClick={addItem}
              className="bg-blue-400 px-3 py-1 rounded"
              disabled={products?.length === 0}
            >
              + {t('addProduct')}
            </button>
          </div>
        </div>

        {selectedItems?.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <select
              value={item.product_id}
              onChange={(e) =>
                updateItem(index, "product_id", Number(e.target.value))
              }
              className="border px-2 py-1"
            >
              {products?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {t('stockLabel', { stock: p.stock })}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              className="border px-2 py-1 w-20"
              value={item.quantity}
              onChange={(e) =>
                updateItem(index, "quantity", Number(e.target.value))
              }
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="bg-red-700 text-white px-3 py-1 rounded"
            >
              {t('remove')}
            </button>
          </div>
        ))}

        {error && <div className="text-red-500">{error}</div>}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={!selectedTableId || selectedItems?.length === 0}
        >
          {t('createOrder')}
        </button>
      </form>
    </div>
  );
}
