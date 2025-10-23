import React, { useState } from "react";
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Product } from "../../types";
import EditProductModal from "./EditProductModal";
import { useData } from "../../contexts/DataContext";
import ConfirmDialog from "../shared/ConfirmDialog";
import { theme } from "../../styles/theme";
import { useTranslation } from "react-i18next";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProductManager() {
  const { t } = useTranslation();
  const { products, loading, refreshAll } = useData();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!name || !price || !stock) {
      Toast.show({ type: "error", text1: t("validationError"), text2: t("allFieldsRequired") });
      return;
    }
    try {
      await axios.post(`${API_URL}/products`, {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
      });
      Toast.show({ type: "success", text1: t("success"), text2: t("productCreatedSuccess") });
      setName("");
      setPrice("");
      setStock("");
      refreshAll();
    } catch (error) {
      Toast.show({ type: "error", text1: t("error"), text2: t("errorCreatingProduct") });
      console.error(error);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setProductIdToDelete(id);
    setIsDialogVisible(true);
  };

  const handleCancelDelete = () => {
    setIsDialogVisible(false);
    setProductIdToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (productIdToDelete === null) return;

    try {
      await axios.delete(`${API_URL}/products/${productIdToDelete}`);
      Toast.show({ type: "success", text1: t("success"), text2: t("productDeletedSuccess") });
      refreshAll();
    } catch (error: any) {
      const message = error.response?.data?.error || t("errorDeletingProduct");
      Toast.show({ type: "error", text1: t("error"), text2: message });
      console.error(error);
    } finally {
      setIsDialogVisible(false);
      setProductIdToDelete(null);
    }
  };

  const handleProductUpdated = () => {
    setIsModalVisible(false);
    setSelectedProduct(null);
    refreshAll();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>{t("loadingProducts")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>
            {t("productManager")}
          </Text>
          <Card style={styles.container}>
            <Card.Content>
              <TextInput label={t("name")} value={name} onChangeText={setName} style={styles.input} />
              <TextInput
                label={t("price")}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                label={t("stock")}
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
                style={styles.input}
              />
            </Card.Content>
            <Card.Actions>
              <Button mode="contained" onPress={handleSubmit}>
                {t("add")} {t("products")}
              </Button>
            </Card.Actions>
          </Card>
        </View>

        <View style={styles.container}>
          <Text variant="titleLarge" style={styles.title}>
            {t("products")}
          </Text>
          {products.map((p) => (
            <Card key={p.id} style={[styles.cardContainer, styles.container]}>
              <Card.Title title={`${t("name")}: ${p.name}`} subtitle={`${t("stock")}: ${p.stock}`} />  
              <Card.Content>
                <Text>{t("price")}: $ {p.price.toFixed(2)} </Text>
              </Card.Content>
              <Card.Actions>
                <Button style={styles.editButton} onPress={() => handleEdit(p)}>
                  <Text style={styles.buttonText}>{t("edit")}</Text>
                </Button>
                <Button style={styles.deleteButton} onPress={() => handleDelete(p.id)}>
                  <Text style={styles.buttonText}>{t("delete")}</Text>
                </Button>
              </Card.Actions>
            </Card>
          ))}
        </View>
      </ScrollView>

      <EditProductModal
        visible={isModalVisible}
        product={selectedProduct}
        onClose={() => setIsModalVisible(false)}
        onProductUpdated={handleProductUpdated}
      />

      <ConfirmDialog
        visible={isDialogVisible}
        title={t("confirmDeleteTitle")}
        message={t("confirmDeleteProduct")}
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
