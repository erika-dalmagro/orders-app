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
import { useTranslation } from "react-i18next";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function TableManager() {
  const { t } = useTranslation();
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
      Toast.show({ type: "error", text1: t("validationError"), text2: t("nameCapacityRequired") });
      return;
    }
    try {
      await axios.post(`${API_URL}/tables`, {
        name,
        capacity: parseInt(capacity),
        single_tab: singleTab,
      });
      Toast.show({ type: "success", text1: t("success"), text2: t("tableCreatedSuccess") });
      setName("");
      setCapacity("");
      setSingleTab(true);
      refreshAll();
    } catch (error) {
      Toast.show({ type: "error", text1: t("error"), text2: t("errorCreatingTable") });
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
      Toast.show({ type: "success", text1: t("success"), text2: t("tableDeletedSuccess") });
      refreshAll();
    } catch (error: any) {
      const apiErrorKey =
        error.response?.data?.error === "Cannot delete table with open orders"
          ? "errorDeleteTableWithOpenOrders"
          : "errorDeletingTable";
      const message = t(apiErrorKey);
      Toast.show({ type: "error", text1: t("error"), text2: message });
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
        <Text>{t("loadingTables")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>
            {t("tableManager")}
          </Text>
          <Card style={styles.container}>
            <Card.Content>
              <TextInput
                label={t("tableNamePlaceholder")}
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
              <TextInput
                label={t("capacity")}
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
                style={styles.input}
              />
              <View style={styles.switchContainer}>
                <Text>{t("singleTab")}</Text>
                <Switch onValueChange={setSingleTab} value={singleTab} />
              </View>
            </Card.Content>
            <Card.Actions>
              <Button mode="contained" onPress={handleSubmit}>
                {t("createTable")}
              </Button>
            </Card.Actions>
          </Card>
        </View>

        <View style={styles.container}>
          <Text variant="titleLarge" style={styles.title}>
            {t("tables")}
          </Text>
          {tables.map((tableItem) => (
            <Card key={tableItem.id} style={[styles.cardContainer, styles.container]}>
              <Card.Title
                title={`${t("tableLabel")} ${tableItem.name}`}
                subtitle={`${t("capacity")}: ${tableItem.capacity}`}
              />

              <Card.Content>
                <Text>
                  {t("tabMode")} {tableItem.single_tab ? t("singleTab") : t("multiple")}
                </Text>{" "}
              </Card.Content>
              <Card.Actions>
                <Button style={styles.editButton} onPress={() => handleEdit(tableItem)}>
                  <Text style={styles.buttonText}>{t("edit")}</Text>
                </Button>
                <Button style={styles.deleteButton} onPress={() => handleDelete(tableItem.id)}>
                  <Text style={styles.buttonText}>{t("delete")}</Text>
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
        title={t("confirmDeleteTitle")}
        message={t("confirmDeleteTable")}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        confirmText={t("delete")}
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
