import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import OrderScreen from '../src/screens/OrderScreen';
import ProductScreen from '../src/screens/ProductScreen';
import TableScreen from '../src/screens/TableScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#333' },
          headerTintColor: '#fff',
          tabBarActiveTintColor: '#007bff',
          tabBarInactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen name="Orders" component={OrderScreen} />
        <Tab.Screen name="Products" component={ProductScreen} />
        <Tab.Screen name="Tables" component={TableScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}