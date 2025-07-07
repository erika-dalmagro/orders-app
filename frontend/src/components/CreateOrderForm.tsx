import { useEffect, useState } from "react";
import axios from "axios";
import type { Product, OrderItem } from "../types";

export default function CreateOrderForm({
  onOrderCreated,
}: {
  onOrderCreated: () => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8080/products")
      .then((res) => setProducts(res.data));
  }, []);

  const addItem = () => {
    if (products.length === 0) {
      alert("Products not loaded yet.");
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

    try {
      await axios.post("http://localhost:8080/orders", {
        table_number: tableNumber,
        items: selectedItems,
      });
      setSelectedItems([]);
      setTableNumber(1);
      onOrderCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error creating order");
    }
  };

  return (
    <div className="border p-4 rounded mb-6">
      <h2 className="text-xl font-bold mb-2">Create New Order</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mr-2 font-medium">Table Number:</label>
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(Number(e.target.value))}
            className="border px-2 py-1 w-24"
            required
          />
        </div>

        {selectedItems.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <select
              value={item.product_id}
              onChange={(e) =>
                updateItem(index, "product_id", Number(e.target.value))
              }
              className="border px-2 py-1"
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
              className="border px-2 py-1 w-20"
              value={item.quantity}
              onChange={(e) =>
                updateItem(index, "quantity", Number(e.target.value))
              }
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-red-500"
            >
              Remove
            </button>
          </div>
        ))}

        <div>
          <button
            type="button"
            onClick={addItem}
            className="bg-blue-400 px-3 py-1 rounded"
          >
            + Add Product
          </button>
        </div>

        {error && <div className="text-red-500">{error}</div>}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Create Order
        </button>
      </form>
    </div>
  );
}
