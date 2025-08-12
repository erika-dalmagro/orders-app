import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Table } from "../types";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface TableContextType {
  allTables: Table[];
  availableTables: Table[];
  loading: boolean;
  loadTables: () => void;
}

export const TableContext = createContext<TableContextType>({
  allTables: [],
  availableTables: [],
  loading: true,
  loadTables: () => {},
});

export const TableProvider = ({ children }: { children: ReactNode }) => {
  const [allTables, setAllTables] = useState<Table[]>([]);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTables = async () => {
    try {
      setLoading(true);
      const [allTablesRes, availableTablesRes] = await Promise.all([
        axios.get(`${API_URL}/tables`),
        axios.get(`${API_URL}/tables/available`),
      ]);
      setAllTables(allTablesRes.data || []);
      setAvailableTables(availableTablesRes.data || []);
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Failed to load tables." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  return (
    <TableContext.Provider value={{ allTables, availableTables, loading, loadTables }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTables = () => {
  return useContext(TableContext);
};
