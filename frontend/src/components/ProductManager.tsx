import { useEffect, useState } from "react";
import axios from "axios";
import type { Product } from "../types";
import EditProductModal from "./EditProductModal"; // Importe a nova modal

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  // Estado para controlar qual produto está sendo editado na modal
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
      alert("Product created successfully!");

      setName("");
      setPrice("");
      setStock("");
      loadProducts();
    } catch (error) {
      alert("An error occurred. Check the console.");
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
        alert("Product deleted successfully!");
        loadProducts();
      } catch (error) {
        alert("Error deleting product.");
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
          required // Tornar obrigatório para adicionar
          min={0} // Preço não pode ser negativo
        />
        <input
          className="border p-2"
          placeholder="Stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required // Tornar obrigatório para adicionar
          min={0} // Estoque não pode ser negativo
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
        >
          Add Product
        </button>
      </form>

      <ul className="space-y-1">
        {products.map((p) => (
          <li key={p.id} className="flex justify-between items-center">
            <strong>{p.name}</strong> — ${p.price.toFixed(2)} — Stock: {p.stock}
            <div className="flex gap-1">
              <button
                onClick={() => handleEdit(p)} // Chama handleEdit para abrir a modal
                className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
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
          </li>
        ))}
      </ul>

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