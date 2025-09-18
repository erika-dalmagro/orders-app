import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Appbar } from "react-native-paper";

import OrderScreen from "../src/screens/OrderScreen";
import ProductScreen from "../src/screens/ProductScreen";
import TableScreen from "../src/screens/TableScreen";
import CalendarScreen from "../src/screens/CalendarScreen";
import { useAppTheme } from "../src/context/ThemeContext";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { theme, toggleTheme, isDarkTheme } = useAppTheme();

  return (
    <NavigationContainer
      theme={theme}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: "gray",
          tabBarStyle: { backgroundColor: theme.colors.surface },
          headerRight: () => (
            <Appbar.Action
              icon={isDarkTheme ? "weather-sunny" : "weather-night"}
              onPress={toggleTheme}
              color={theme.colors.onSurface}
            />
          ),
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Orders") {
              iconName = focused ? "receipt" : "receipt-outline";
            } else if (route.name === "Products") {
              iconName = focused ? "fast-food" : "fast-food-outline";
            } else if (route.name === "Tables") {
              iconName = focused
                ? "tablet-landscape"
                : "tablet-landscape-outline";
            } else if (route.name === "Calendar") {
              iconName = focused ? "calendar" : "calendar-outline";
            } else {
              iconName = "alert-circle";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Orders" component={OrderScreen} />
        <Tab.Screen name="Products" component={ProductScreen} />
        <Tab.Screen name="Tables" component={TableScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}