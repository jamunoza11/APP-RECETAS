// src/navigation/AppStack.js
import React from 'react';
import { Button } from 'react-native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import RecipesListScreen from '../screens/RecipesListScreen';
import RecipeFormScreen from '../screens/RecipeFormScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        presentation: 'card',
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        headerStyle: { backgroundColor: '#ff6347' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="RecipesList" 
        component={RecipesListScreen} 
        options={({ navigation }) => ({
          title: 'Mis Recetas',
          headerLeft: () => (
            <Button 
              onPress={() => navigation.toggleDrawer()} 
              title="☰ Menú" 
              color="#ff6347" 
            />
          ),
        })} 
      />
      <Stack.Screen 
        name="RecipeForm" 
        component={RecipeFormScreen} 
        options={{ title: 'Nueva Receta' }} 
      />
      <Stack.Screen 
        name="RecipeDetail" 
        component={RecipeDetailScreen} 
        options={{ title: 'Detalle de la Receta' }} 
      />
    </Stack.Navigator>
  );
}