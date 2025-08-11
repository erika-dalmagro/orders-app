import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Modal, Button, Switch } from "react-native";
import axios from "axios";
import { Table } from "../types";
import Toast from "react-native-toast-message";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface EditTableModalProps {
  table: Table | null;
  visible: boolean;
  onClose: () => void;
  onTableUpdated: () => void;
}

export default function EditTableModal({ table, visible, onClose, onTableUpdated }: EditTableModalProps) {
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
        text1: "Success",
        text2: "Table updated successfully!",
      });
      onTableUpdated();
    } catch (err: any) {
      const message = err.response?.data?.error || "Error updating table.";
      Toast.show({ type: "error", text1: "Error", text2: message });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Edit Table: {table?.name}</Text>

          <TextInput style={styles.input} placeholder="Table Name" value={name} onChangeText={setName} />
          <TextInput
            style={styles.input}
            placeholder="Capacity"
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="numeric"
          />
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Single Tab</Text>
            <Switch onValueChange={setSingleTab} value={singleTab} />
          </View>

          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={onClose} color="#6c757d" />
            <Button title="Save Changes" onPress={handleSubmit} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
});
