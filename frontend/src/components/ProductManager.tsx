import { useEffect, useState } from "react";
import axios from "axios";
import type { Product } from "../types";

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const loadProducts = () => {
    axios
      .get("http://localhost:8080/products")
      .then((res) => setProducts(res.data));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post("http://localhost:8080/products", {
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
    });

    setName("");
    setPrice("");
    setStock("");
    loadProducts();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Product Manager</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          className="border p-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
        >
          Add
        </button>
      </form>

      <ul className="space-y-1">
        {products.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong> — ${p.price.toFixed(2)} — Stock: {p.stock}
          </li>
        ))}
      </ul>
    </div>
  );
}
