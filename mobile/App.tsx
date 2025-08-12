import React from "react";
import AppNavigator from "./navigation/AppNavigator";
import Toast from "react-native-toast-message";
import { ProductProvider } from "./src/context/ProductContext";
import { TableProvider } from "./src/context/TableContext";

export default function App() {
  return (
    <>
      <ProductProvider>
        <TableProvider>
          <AppNavigator />
        </TableProvider>
      </ProductProvider>
      <Toast />
    </>
  );
}
