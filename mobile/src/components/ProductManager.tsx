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
} from "react-native";
import axios from "axios";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const loadProducts = () => {
    axios
      .get(`${API_URL}/products`)
      .then((res) => setProducts(res.data))
      .catch(() => Alert.alert("Error", "Failed to load products."));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async () => {
    if (!name || !price || !stock) {
        Alert.alert("Validation Error", "All fields are required.");
        return;
    }
    try {
      await axios.post(`${API_URL}/products`, {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
      });
      Alert.alert("Success", "Product created successfully!");
      setName("");
      setPrice("");
      setStock("");
      loadProducts();
    } catch (error) {
      Alert.alert("Error", "An error occurred while creating the product.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Product Manager</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Stock"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
          />
          <Button title="Add Product" onPress={handleSubmit} />
        </View>

        <View style={styles.list}>
          <Text style={styles.title}>Products</Text>
          {products.map((p) => (
            <View key={p.id} style={styles.productItem}>
              <Text style={styles.productName}>{p.name}</Text>
              <Text>Price: $ {p.price.toFixed(2)}</Text>
              <Text>Stock: {p.stock}</Text>
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
  list: {
    marginTop: 20,
  },
  productItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 5,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#007bff'
  },
});