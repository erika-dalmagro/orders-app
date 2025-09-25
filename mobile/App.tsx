import React from "react";
import { PaperProvider } from "react-native-paper";
import AppNavigator from "./navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { ProductProvider } from "./src/contexts/ProductContext";
import { TableProvider } from "./src/contexts/TableContext";
import { ThemeProvider, useAppTheme } from "./src/contexts/ThemeContext";

const AppContent = () => {
  const { theme } = useAppTheme();
  return (
    <PaperProvider theme={theme}>
      <ProductProvider>
        <TableProvider>
          <AppNavigator />
        </TableProvider>
      </ProductProvider>
      <Toast />
    </PaperProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
