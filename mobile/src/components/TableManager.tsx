import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Table } from "../types";
import EditTableModal from "./EditTableModal";
import { useTables } from "../context/TableContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function TableManager() {
  const { allTables, loading, loadTables } = useTables();

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [singleTab, setSingleTab] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const handleSubmit = async () => {
    if (!name || !capacity) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "Name and Capacity are required." });
      return;
    }
    try {
      await axios.post(`${API_URL}/tables`, {
        name,
        capacity: parseInt(capacity),
        single_tab: singleTab,
      });
      Toast.show({ type: "success", text1: "Success", text2: "Table created successfully!" });
      setName("");
      setCapacity("");
      setSingleTab(true);
      loadTables();
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "An error occurred creating the table." });
      console.error(error);
    }
  };

  const handleEdit = (table: Table) => {
    setSelectedTable(table);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete Table", "Are you sure you want to delete this table?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/tables/${id}`);
            Toast.show({ type: "success", text1: "Success", text2: "Table deleted successfully!" });
            loadTables();
          } catch (error: any) {
            const message = error.response?.data?.error || "Error deleting table.";
            Toast.show({ type: "error", text1: "Error", text2: message });
            console.error(error);
          }
        },
      },
    ]);
  };

  const handleTableUpdated = () => {
    setIsModalVisible(false);
    setSelectedTable(null);
    loadTables();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading tables...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Table Manager</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Table Name (e.g., Table 1, Bar)"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Capacity"
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="numeric"
          />
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Single Tab</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={singleTab ? "#f5dd4b" : "#f4f3f4"}
              onValueChange={setSingleTab}
              value={singleTab}
            />
          </View>
          <Button title="Add Table" onPress={handleSubmit} />
        </View>

        <View style={styles.list}>
          <Text style={styles.title}>Tables</Text>
          {allTables.map((t) => (
            <View key={t.id} style={styles.tableItem}>
              <View>
                <Text style={styles.tableName}>{t.name}</Text>
                <Text style={styles.tableDetail}>Capacity: {t.capacity}</Text>
                <Text style={styles.tableDetail}>Tab: {t.single_tab ? "Single" : "Multiple"}</Text>
              </View>
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(t)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(t.id)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <EditTableModal
        visible={isModalVisible}
        table={selectedTable}
        onClose={() => setIsModalVisible(false)}
        onTableUpdated={handleTableUpdated}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  form: {
    marginBottom: 30,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "white",
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 16,
  },
  list: {
    marginTop: 20,
  },
  tableItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28a745",
  },
  tableDetail: {
    fontSize: 14,
    color: "#6c757d",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#ffc107",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
});
