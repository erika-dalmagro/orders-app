import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Appbar, Button, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { View } from 'react-native'; 

import OrderScreen from "../src/screens/OrderScreen";
import ProductScreen from "../src/screens/ProductScreen";
import TableScreen from "../src/screens/TableScreen";
import CalendarScreen from "../src/screens/CalendarScreen";
import { useAppTheme } from "../src/contexts/ThemeContext";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { theme, toggleTheme, isDarkTheme } = useAppTheme();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <NavigationContainer theme={theme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: "gray",
          tabBarStyle: { backgroundColor: theme.colors.surface },
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 5 }}>
               <Button
                 mode={i18n.language.startsWith('pt') ? "contained" : "text"}
                 onPress={() => changeLanguage('pt')}
                 compact
                 style={{ marginRight: 5 }}
                 labelStyle={{ marginVertical: 4, marginHorizontal: 6 }}
               >
                 PT
               </Button>
               <Button
                 mode={i18n.language.startsWith('en') ? "contained" : "text"}
                 onPress={() => changeLanguage('en')}
                 compact
                 style={{ marginRight: 5 }}
                 labelStyle={{ marginVertical: 4, marginHorizontal: 6 }}
               >
                 EN
               </Button>
              <Appbar.Action
                icon={isDarkTheme ? "weather-sunny" : "weather-night"}
                onPress={toggleTheme}
                color={theme.colors.onSurface}
              />
            </View>
          ),
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            const routeNameToIconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
                [t('orders')]: focused ? 'receipt' : 'receipt-outline',
                [t('products')]: focused ? 'fast-food' : 'fast-food-outline',
                [t('tables')]: focused ? 'tablet-landscape' : 'tablet-landscape-outline',
                [t('calendar')]: focused ? 'calendar' : 'calendar-outline',
            };

            iconName = routeNameToIconMap[route.name] || 'alert-circle';

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarLabel: ({ focused, color }) => {
             return <Text style={{ color, fontSize: focused ? 11 : 10 }}>{route.name}</Text>;
           },
          headerTitle: route.name
        })}
      >
        <Tab.Screen name={t('orders')} component={OrderScreen} />
        <Tab.Screen name={t('products')} component={ProductScreen} />
        <Tab.Screen name={t('tables')} component={TableScreen} />
        <Tab.Screen name={t('calendar')} component={CalendarScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
