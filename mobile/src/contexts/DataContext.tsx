import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Product, Table, Order } from "../types";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface DataContextType {
  products: Product[];
  tables: Table[];
  availableTables: Table[];
  orders: Order[];
  loading: boolean;
  loadProducts: () => void;
  loadTables: () => void;
  loadOrders: () => void;
  refreshAll: () => void;
}

export const DataContext = createContext<DataContextType>({
  products: [],
  tables: [],
  availableTables: [],
  orders: [],
  loading: true,
  loadProducts: () => {},
  loadTables: () => {},
  loadOrders: () => {},
  refreshAll: () => {},
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      setProducts(res.data || []);
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to load products." });
    }
  };

  const loadTables = async () => {
    try {
      const [allTablesRes, availableTablesRes] = await Promise.all([
        axios.get(`${API_URL}/tables`),
        axios.get(`${API_URL}/tables/available`),
      ]);
      setTables(allTablesRes.data || []);
      setAvailableTables(availableTablesRes.data || []);
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to load tables." });
    }
  };

  const loadOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders`);
      setOrders(res.data || []);
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to load orders." });
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadTables(), loadOrders()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <DataContext.Provider
      value={{
        products,
        tables,
        availableTables,
        orders,
        loading,
        loadProducts,
        loadTables,
        loadOrders,
        refreshAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  return useContext(DataContext);
};
