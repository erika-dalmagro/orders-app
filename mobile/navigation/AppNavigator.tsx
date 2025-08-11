import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import OrderScreen from "../src/screens/OrderScreen";
import ProductScreen from "../src/screens/ProductScreen";
import TableScreen from "../src/screens/TableScreen";
import CalendarScreen from "../src/screens/CalendarScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Orders") {
              iconName = focused ? "receipt" : "receipt-outline";
            } else if (route.name === "Products") {
              iconName = focused ? "fast-food" : "fast-food-outline";
            } else if (route.name === "Tables") {
              iconName = focused ? "tablet-landscape" : "tablet-landscape-outline";
            } else if (route.name === "Calendar") {
              iconName = focused ? "calendar" : "calendar-outline";
            }

            return <Ionicons name={iconName as any} size={size} color={color} />;
          },

          headerStyle: { backgroundColor: "#333" },
          headerTintColor: "#fff",
          tabBarActiveTintColor: "#007bff",
          tabBarInactiveTintColor: "gray",
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
