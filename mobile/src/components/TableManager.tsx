import React, { useEffect, useState } from "react";
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
} from "react-native";
import axios from "axios";

type Table = {
  id: number;
  name: string;
  capacity: number;
  single_tab: boolean;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function TableManager() {
  const [tables, setTables] = useState<Table[]>([]);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [singleTab, setSingleTab] = useState(true);

  const loadTables = () => {
    axios
      .get(`${API_URL}/tables`)
      .then((res) => setTables(res.data))
      .catch(() => Alert.alert("Error", "Failed to load tables."));
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleSubmit = async () => {
    if (!name || !capacity) {
        Alert.alert("Validation Error", "Name and Capacity are required.");
        return;
    }
    try {
      await axios.post(`${API_URL}/tables`, {
        name,
        capacity: parseInt(capacity),
        single_tab: singleTab,
      });
      Alert.alert("Success", "Table created successfully!");
      setName("");
      setCapacity("");
      setSingleTab(true);
      loadTables();
    } catch (error) {
      Alert.alert("Error", "An error occurred creating the table.");
      console.error(error);
    }
  };

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
          {tables.map((t) => (
            <View key={t.id} style={styles.tableItem}>
              <Text style={styles.tableName}>{t.name}</Text>
              <Text style={styles.tableDetail}>Capacity: {t.capacity}</Text>
              <Text style={styles.tableDetail}>
                Tab: {t.single_tab ? "Single" : "Multiple"}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: '#333',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 5,
  },
  tableName: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#28a745'
  },
  tableDetail: {
    fontSize: 14,
    color: '#6c757d',
  },
});