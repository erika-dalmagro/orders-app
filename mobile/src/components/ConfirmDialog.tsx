import React from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { theme } from "../styles/theme";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
}

const ConfirmDialog = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = "Delete",
}: ConfirmDialogProps) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogContainer}>
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogMessage}>{message}</Text>
          <View style={styles.dialogActions}>
            <TouchableOpacity
              style={[styles.dialogButton, styles.dialogCancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.dialogCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dialogButton, styles.dialogConfirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.dialogConfirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dialogOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  dialogContainer: {
    width: "80%",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: theme.spacing.sm,
  },
  dialogMessage: {
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  dialogButton: {
    marginLeft: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  dialogCancelButton: {
    backgroundColor: theme.colors.light,
  },
  dialogConfirmButton: {
    backgroundColor: theme.colors.danger,
  },
  dialogCancelButtonText: {
    fontSize: 16,
    color: theme.colors.dark,
  },
  dialogConfirmButtonText: {
    fontSize: 16,
    color: theme.colors.white,
    fontWeight: "bold",
  },
});

export default ConfirmDialog;