import { useEffect, useState } from "react";
import axios from "axios";
import type { Product } from "../types";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface EditProductModalProps {
  product: Product | null;
  onClose: () => void;
  onProductUpdated: () => void;
}

export default function EditProductModal({
  product,
  onClose,
  onProductUpdated,
}: EditProductModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setError("");
    }
  }, [product]);

  if (!product) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await axios.put(`http://localhost:8080/products/${product.id}`, {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
      });
      toast.success(t("productUpdatedSuccess"));
      onProductUpdated();
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || t("errorUpdatingProduct");
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white text-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {t("editProductTitle", { productName: product.name })}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="productName"
              className="block text-sm font-medium text-gray-700"
            >
              {t('name')}:
            </label>
            <input
              id="productName"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder={t('name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="productPrice"
              className="block text-sm font-medium text-gray-700"
            >
              {t('price')}:
            </label>
            <input
              id="productPrice"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder={t('price')}
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min={0}
              step="0.01"
            />
          </div>
          <div>
            <label
              htmlFor="productStock"
              className="block text-sm font-medium text-gray-700"
            >
              {t('stock')}:
            </label>
            <input
              id="productStock"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder={t('stock')}
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              min={0}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-150 ease-in-out"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-150 ease-in-out"
            >
              {t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
