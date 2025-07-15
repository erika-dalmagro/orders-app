import { useEffect, useState } from "react";
import axios from "axios";
import type { Order, Product, OrderItem } from "../types";

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
  const [tableNumber, setTableNumber] = useState(order?.table_number || 1);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8080/products")
      .then((res) => setProducts(res.data));

    if (order) {
      setTableNumber(order.table_number);
      setItems(order.items);
    }
  }, [order]);

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
      alert("Products not loaded.");
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

    try {
      await axios.put(`http://localhost:8080/orders/${order.id}`, {
        table_number: tableNumber,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });
      alert("Order updated successfully!");
      onOrderUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error updating order");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">
          Edit Order — Table #{order.table_number}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-medium">Table N°:</label>
            <input
              type="number"
              value={tableNumber}
              onChange={(e) => setTableNumber(Number(e.target.value))}
              className="border p-2 rounded w-full"
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
