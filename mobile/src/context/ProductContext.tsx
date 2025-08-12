import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Product } from "../types";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface ProductContextType {
  products: Product[];
  loading: boolean;
  loadProducts: () => void;
}

export const ProductContext = createContext<ProductContextType>({
  products: [],
  loading: true,
  loadProducts: () => {},
});

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data || []);
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to load products." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, loadProducts }}>{children}</ProductContext.Provider>
  );
};

export const useProducts = () => {
  return useContext(ProductContext);
};
