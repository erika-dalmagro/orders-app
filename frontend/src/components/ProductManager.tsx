import { useEffect, useState } from "react";
import axios from "axios";
import type { Product } from "../types";
import EditProductModal from "./EditProductModal";
import toast from "react-hot-toast";

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [editingProductInModal, setEditingProductInModal] = useState<Product | null>(null);

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
    try {
      await axios.post("http://localhost:8080/products", {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
      });
      toast.success("Product created successfully!");

      setName("");
      setPrice("");
      setStock("");
      loadProducts();
    } catch (error) {
      toast.error("An error occurred creating product. Check the console.");
      console.error(error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProductInModal(product);
  };

  const handleCloseModal = () => {
    setEditingProductInModal(null);
  };

  const handleProductUpdated = () => {
    loadProducts();
    handleCloseModal();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:8080/products/${id}`);
        toast.success("Product deleted successfully!");
        loadProducts();
      } catch (error) {
        toast.error("Error deleting product.");
        console.error(error);
      }
    }
  };

  return (
    <div className="border p-6 rounded mb-6 shadow">
      <h2 className="text-xl font-bold mb-4">Product Manager</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          className="border p-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="border p-2"
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min={0}
        />
        <input
          className="border p-2"
          placeholder="Stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
          min={0}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
        >
          Add Product
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-left text-gray-700">Name</th>
              <th className="py-2 px-4 border-b text-left text-gray-700">Price</th>
              <th className="py-2 px-4 border-b text-left text-gray-700">Stock</th>
              <th className="py-2 px-4 border-b text-left text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
        {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="py-2 px-4 text-gray-900">{p.name}</td>
                <td className="py-2 px-4 text-gray-900">${p.price.toFixed(2)}</td>
                <td className="py-2 px-4 text-gray-900">{p.stock}</td>
                <td className="py-2 px-4">
            <div className="flex gap-1">
              <button
                onClick={() => handleEdit(p)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
                </td>
              </tr>
        ))}
          </tbody>
        </table>
      </div>

      {editingProductInModal && (
        <EditProductModal
          product={editingProductInModal}
          onClose={handleCloseModal}
          onProductUpdated={handleProductUpdated}
        />
      )}
    </div>
  );
}