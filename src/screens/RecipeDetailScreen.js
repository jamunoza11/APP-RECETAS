// src/screens/RecipeDetailScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDatabase } from '../database/db';

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);

  const loadRecipeDetails = async () => {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync('SELECT * FROM recipes WHERE id = ?;', [recipeId]);
      setRecipe(result);
    } catch (error) {
      console.error('Error al cargar detalle de la receta:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecipeDetails();
    }, [recipeId])
  );

  const toggleFavorite = async () => {
    try {
      const db = await getDatabase();
      const newFavoriteStatus = recipe.is_favorite === 1 ? 0 : 1;
      await db.runAsync('UPDATE recipes SET is_favorite = ? WHERE id = ?;', [newFavoriteStatus, recipeId]);
      setRecipe({ ...recipe, is_favorite: newFavoriteStatus });
    } catch (error) {
      console.error('Error al cambiar estado de favorito:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Receta',
      '¿Estás seguro de que deseas eliminar esta receta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const db = await getDatabase();
              await db.runAsync('DELETE FROM recipes WHERE id = ?;', [recipeId]);
              Alert.alert('Éxito', 'Receta eliminada');
              navigation.goBack();
            } catch (error) {
              console.error('Error al eliminar la receta:', error);
            }
          } 
        }
      ]
    );
  };

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Cargando receta...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{recipe.name}</Text>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favButton}>
          <Text style={styles.favIcon}>{recipe.is_favorite === 1 ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.time}>⏱ Tiempo de preparación: {recipe.prep_time_minutes} mins</Text>

      <Text style={styles.sectionTitle}>Ingredientes:</Text>
      <Text style={styles.textContent}>{recipe.ingredients}</Text>

      <Text style={styles.sectionTitle}>Instrucciones:</Text>
      <Text style={styles.textContent}>{recipe.instructions}</Text>

      {/* Botón para Editar Receta */}
      <TouchableOpacity 
        style={styles.editButton} 
        onPress={() => navigation.navigate('RecipeForm', { recipeId: recipe.id })}
      >
        <Text style={styles.editButtonText}>✏️ Editar Receta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Eliminar Receta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', flex: 1 },
  favButton: { padding: 8 },
  favIcon: { fontSize: 28 },
  time: { fontSize: 14, color: '#666', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#9370db', marginTop: 16, marginBottom: 6 },
  textContent: { fontSize: 16, color: '#444', lineHeight: 22, backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8 },
  editButton: { backgroundColor: '#9370db', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  deleteButton: { backgroundColor: '#ff4d4d', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 12, marginBottom: 20 },
  deleteButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});