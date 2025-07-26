import { useEffect, useState } from "react";
import axios from "axios";
import type { Order, Product, OrderItem, Table } from "../types";
import toast from "react-hot-toast";

interface EditOrderModalProps {
  order: Order | null;
  onClose: () => void;
  onOrderUpdated: () => void;
}

export default function EditOrderModal({
  order,
  onClose,
  onOrderUpdated,
}: EditOrderModalProps) {
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [orderDate, setOrderDate] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8080/products")
      .then((res) => setProducts(res.data))
      .catch(() => toast.error("Failed to load products for order editing."));

    if (order) {
      setSelectedTableId(order.table_id);
      setItems(order.items);
      loadTablesForEdit(order.table_id);
      setOrderDate(new Date(order.date).toISOString().split("T")[0]);
    }
  }, [order]);

  const loadTablesForEdit = (currentTableId: number) => {
    axios
      .get("http://localhost:8080/tables")
      .then((allTablesRes) => {
        axios
          .get("http://localhost:8080/tables/available")
          .then((availableTablesRes) => {
            const allTables: Table[] = allTablesRes.data;
            const currentAvailableTables: Table[] = availableTablesRes.data;

            if (allTables?.length == 1 && allTables[0].id == currentTableId) {
              return;
            }

            const combinedTables = Array.from(
              new Set([
                ...currentAvailableTables.map((t) => JSON.stringify(t)),
                ...allTables
                  .filter((t) => t.id === currentTableId)
                  .map((t) => JSON.stringify(t)),
              ])
            ).map((t) => JSON.parse(t));

            setAvailableTables(combinedTables);

            if (!combinedTables.some((t) => t.id === currentTableId)) {
              setSelectedTableId(currentTableId);
            }
          })
          .catch(() =>
            toast.error("Failed to load available tables for order editing.")
          );
      })
      .catch(() => toast.error("Failed to load all tables for order editing."));
  };

  if (!order) {
    return null;
  }

  const handleUpdateItem = (
    index: number,
    field: keyof OrderItem,
    value: any
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    if (products.length > 0) {
      setItems([...items, { product_id: products[0].id, quantity: 1 }]);
    } else {
      toast.error("Products not loaded.");
    }
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedTableId) {
      toast.error("Please select a table.");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item to the order.");
      return;
    }

    try {
      await axios.put(`http://localhost:8080/orders/${order.id}`, {
        table_id: selectedTableId,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        date: orderDate,
      });
      toast.success("Order updated successfully!");
      onOrderUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error updating order");
      toast.error(err.response?.data?.error || "Error updating order");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">
          Edit Order — Table {order.table?.name || `#${order.table_id}`}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="tableSelect"
              className="block text-sm font-medium text-gray-700"
            >
              Table:
            </label>
            <select
              id="tableSelect"
              value={selectedTableId || ""}
              onChange={(e) => setSelectedTableId(Number(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
              disabled={
                availableTables.length === 0 && selectedTableId === null
              }
            >
              {availableTables.length === 0 && selectedTableId === null && (
                <option value="">No tables available</option>
              )}
              {order.table &&
                !availableTables.some((t) => t.id === order.table?.id) && (
                  <option key={order.table.id} value={order.table.id}>
                    {order.table.name} (Current Order's Table)
                  </option>
                )}
              {availableTables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name} (Capacity: {table.capacity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="orderDate"
              className="block text-sm font-medium text-gray-700"
            >
              Date:
            </label>
            <input
              type="date"
              id="orderDate"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          <h3 className="text-xl font-semibold">Itens</h3>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={item.product_id}
                onChange={(e) =>
                  handleUpdateItem(index, "product_id", Number(e.target.value))
                }
                className="border p-2 rounded w-full"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.stock})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  handleUpdateItem(index, "quantity", Number(e.target.value))
                }
                className="border p-2 rounded w-24"
              />
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="bg-red-700 text-white px-3 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddItem}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={products.length === 0}
          >
            + Add Product
          </button>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
