import React from "react";
import { PaperProvider } from "react-native-paper"; 
import AppNavigator from "./navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { ProductProvider } from "./src/context/ProductContext";
import { TableProvider } from "./src/context/TableContext";
import { ThemeProvider, useAppTheme } from "./src/context/ThemeContext";

const AppContent = () => {
  const { theme } = useAppTheme()
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