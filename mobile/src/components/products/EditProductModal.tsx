import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Card, Modal, Portal, Text, TextInput } from "react-native-paper";
import axios from "axios";
import { Product } from "../../types";
import Toast from "react-native-toast-message";
import { theme } from "../../styles/theme";
import { useTranslation } from "react-i18next";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface EditProductModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
}

export default function EditProductModal({
  product,
  visible,
  onClose,
  onProductUpdated,
}: EditProductModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
    }
  }, [product]);

  const handleSubmit = async () => {
    if (!product) return;

    try {
      await axios.put(`${API_URL}/products/${product.id}`, {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
      });
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("productUpdatedSuccess"),
      });
      onProductUpdated();
    } catch (err: any) {
      const message = err.response?.data?.error || t("errorUpdatingProduct");
      Toast.show({ type: "error", text1: t("error"), text2: message });
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
        <Card style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>
            {t("editProductTitle", { productName: product?.name })}
          </Text>
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
    marginTop: 15,
    marginBottom: 12,
  },
});
