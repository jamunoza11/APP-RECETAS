// src/navigation/AppTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import AppStack from './AppStack';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#9370db', // Morado elegante seleccionado
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        }
      }}
    >
      <Tab.Screen 
        name="RecipesTab" 
        component={AppStack} 
        options={{ 
          title: 'Recetas',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🍴</Text>,
        }} 
      />
    </Tab.Navigator>
  );
}