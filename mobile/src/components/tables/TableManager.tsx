import React, { useState } from "react";
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Switch } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Table } from "../../types";
import EditTableModal from "./EditTableModal";
import { useData } from "../../contexts/DataContext";
import ConfirmDialog from "../shared/ConfirmDialog";
import { theme } from "../../styles/theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function TableManager() {
  const { tables, loading, refreshAll } = useData();

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [singleTab, setSingleTab] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [tableIdToDelete, setTableIdToDelete] = useState<number | null>(null);

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
      refreshAll();
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
    setTableIdToDelete(id);
    setIsDialogVisible(true);
  };

  const handleCancelDelete = () => {
    setIsDialogVisible(false);
    setTableIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (tableIdToDelete === null) return;

    try {
      await axios.delete(`${API_URL}/tables/${tableIdToDelete}`);
      Toast.show({ type: "success", text1: "Success", text2: "Table deleted successfully!" });
      refreshAll();
    } catch (error: any) {
      const message = error.response?.data?.error || "Error deleting table.";
      Toast.show({ type: "error", text1: "Error", text2: message });
      console.error(error);
    } finally {
      setIsDialogVisible(false);
      setTableIdToDelete(null);
    }
  };

  const handleTableUpdated = () => {
    setIsModalVisible(false);
    setSelectedTable(null);
    refreshAll();
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
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>
            Table Manager
          </Text>
          <Card style={styles.container}>
            <Card.Content>
              <TextInput
                label="Table Name (e.g., Table 1, Bar)"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
              <TextInput
                label="Capacity"
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
                style={styles.input}
              />
              <View style={styles.switchContainer}>
                <Text>Single Tab</Text>
                <Switch onValueChange={setSingleTab} value={singleTab} />
              </View>
            </Card.Content>
            <Card.Actions>
              <Button mode="contained" onPress={handleSubmit}>
                Create Table
              </Button>
            </Card.Actions>
          </Card>
        </View>

        <View style={styles.container}>
          <Text variant="titleLarge" style={styles.title}>
            Tables
          </Text>
          {tables.map((t) => (
            <Card key={t.id} style={[styles.cardContainer, styles.container]}>
              <Card.Title title={`Table: ${t.name}`} subtitle={`Capacity: ${t.capacity}`} />
              <Card.Content>
                <Text>Tab Mode: {t.single_tab ? "Single" : "Multiple"}</Text>
              </Card.Content>
              <Card.Actions>
                <Button style={styles.editButton} onPress={() => handleEdit(t)}>
                  <Text style={styles.buttonText}>Edit</Text>
                </Button>
                <Button style={styles.deleteButton} onPress={() => handleDelete(t.id)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </View>
      </ScrollView>

      <EditTableModal
        visible={isModalVisible}
        table={selectedTable}
        onClose={() => setIsModalVisible(false)}
        onTableUpdated={handleTableUpdated}
      />

      <ConfirmDialog
        visible={isDialogVisible}
        title="Delete Table"
        message="Are you sure you want to delete this table?"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  cardContainer: {
    marginVertical: theme.spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 15,
    paddingHorizontal: 12,
  },
  buttonText: {
    color: "white",
  },
  editButton: {
    borderWidth: 0,
    backgroundColor: "#ffc107",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
  },
});
