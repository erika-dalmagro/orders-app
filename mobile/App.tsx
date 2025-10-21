import React from "react";
import { PaperProvider } from "react-native-paper";
import AppNavigator from "./navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { DataProvider } from "./src/contexts/DataContext";
import { ThemeProvider, useAppTheme } from "./src/contexts/ThemeContext";
import './src/i18n';

const AppContent = () => {
  const { theme } = useAppTheme();
  return (
    <PaperProvider theme={theme}>
      <DataProvider>
        <AppNavigator />
      </DataProvider>
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
