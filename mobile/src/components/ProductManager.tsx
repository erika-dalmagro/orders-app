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
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Product } from "../types";
import EditProductModal from "./EditProductModal";
import { useProducts } from "../context/ProductContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProductManager() {
  const { products, loading, loadProducts } = useProducts();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSubmit = async () => {
    if (!name || !price || !stock) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "All fields are required." });
      return;
    }
    try {
      await axios.post(`${API_URL}/products`, {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
      });
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Product created successfully!",
      });
      setName("");
      setPrice("");
      setStock("");
      loadProducts();
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Could not create product." });
      console.error(error);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete Product", "Are you sure you want to delete this product?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/products/${id}`);
            Toast.show({ type: "success", text1: "Success", text2: "Product deleted successfully!" });
            loadProducts();
          } catch (error) {
            Toast.show({ type: "error", text1: "Error", text2: "Error deleting product." });
            console.error(error);
          }
        },
      },
    ]);
  };

  const handleProductUpdated = () => {
    setIsModalVisible(false);
    setSelectedProduct(null);
    loadProducts();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Product Manager</Text>

        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Product Name" value={name} onChangeText={setName} />
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
              <View>
                <Text style={styles.productName}>{p.name}</Text>
                <Text>Price: $ {p.price.toFixed(2)}</Text>
                <Text>Stock: {p.stock}</Text>
              </View>
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(p)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(p.id)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <EditProductModal
        visible={isModalVisible}
        product={selectedProduct}
        onClose={() => setIsModalVisible(false)}
        onProductUpdated={handleProductUpdated}
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
  list: {
    marginTop: 20,
  },
  productItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
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
