import React from "react";
import { Button, Dialog, Portal, Text } from "react-native-paper";
import { theme } from "../../styles/theme";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
}

const ConfirmDialog = ({ visible, title, message, onCancel, onConfirm, confirmText }: ConfirmDialogProps) => {
  const { t } = useTranslation();

  return (
    <Portal>
      <Dialog style={styles.dialogContainer} visible={visible} onDismiss={onCancel}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.dialogActions}>
          <Button style={[styles.buttons, styles.dialogCancelButton]} onPress={onCancel}>
            <Text style={styles.dialogCancelButtonText}>{t("cancel")}</Text>
          </Button>

          <Button style={[styles.buttons, styles.dialogConfirmButton]} onPress={onConfirm}>
            <Text style={styles.dialogConfirmButtonText}>{confirmText || t("delete")}</Text>
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialogContainer: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingBottom: theme.spacing.md,
  },
  buttons: {
    paddingHorizontal: theme.spacing.md,
    borderRadius: "60px",
    marginVertical: 0,
  },
  dialogCancelButton: {
    backgroundColor: theme.colors.light,
  },
  dialogConfirmButton: {
    backgroundColor: theme.colors.danger,
  },
  dialogCancelButtonText: {
    color: theme.colors.dark,
  },
  dialogConfirmButtonText: {
    color: theme.colors.white,
  },
});

export default ConfirmDialog;
