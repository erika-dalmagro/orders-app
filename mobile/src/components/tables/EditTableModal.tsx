import React, { useEffect, useState } from "react";
import { View, StyleSheet, Switch } from "react-native";
import { Button, Card, Modal, Portal, Text, TextInput } from "react-native-paper";
import axios from "axios";
import { Table } from "../../types";
import Toast from "react-native-toast-message";
import { theme } from "../../styles/theme";
import { useTranslation } from "react-i18next";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface EditTableModalProps {
  table: Table | null;
  visible: boolean;
  onClose: () => void;
  onTableUpdated: () => void;
}

export default function EditTableModal({ table, visible, onClose, onTableUpdated }: EditTableModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [singleTab, setSingleTab] = useState(true);

  useEffect(() => {
    if (table) {
      setName(table.name);
      setCapacity(table.capacity.toString());
      setSingleTab(table.single_tab);
    }
  }, [table]);

  const handleSubmit = async () => {
    if (!table) return;

    try {
      await axios.put(`${API_URL}/tables/${table.id}`, {
        name,
        capacity: parseInt(capacity),
        single_tab: singleTab,
      });
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("tableUpdatedSuccess"),
      });
      onTableUpdated();
    } catch (err: any) {
      const message = err.response?.data?.error || t("errorUpdatingTable");
      Toast.show({ type: "error", text1: t("error"), text2: message });
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
        <Card style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>
            {t("editTableTitle", { tableName: table?.name })}
          </Text>
          <Card.Content>
            <TextInput label={t("name")} value={name} onChangeText={setName} style={styles.input} />
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
            <Button onPress={onClose}>{t("cancel")}</Button>
            <Button onPress={handleSubmit}>{t("saveChanges")}</Button>
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  container: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  title: {
    marginTop: 10,
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
});
