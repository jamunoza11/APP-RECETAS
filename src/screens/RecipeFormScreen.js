// src/screens/RecipeForm.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { getDatabase } from '../database/db';
import { AuthContext } from '../context/AuthContext';

export default function RecipeForm({ route, navigation }) {
  const recipeId = route.params?.recipeId; // Si viene, estamos editando
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const { userToken } = useContext(AuthContext);

  useEffect(() => {
    if (recipeId) {
      loadRecipeData();
    }
  }, [recipeId]);

  const loadRecipeData = async () => {
    try {
      const db = await getDatabase();
      const recipe = await db.getFirstAsync('SELECT * FROM recipes WHERE id = ?;', [recipeId]);
      if (recipe) {
        setName(recipe.name);
        setIngredients(recipe.ingredients || '');
        setInstructions(recipe.instructions || '');
        setPrepTime(recipe.prep_time_minutes ? recipe.prep_time_minutes.toString() : '');
      }
    } catch (error) {
      console.error('Error al cargar receta para editar:', error);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !instructions.trim()) {
      Alert.alert('Error', 'El nombre y las instrucciones son obligatorios.');
      return;
    }

    try {
      const db = await getDatabase();
      const timeVal = parseInt(prepTime) || 15;

      if (recipeId) {
        // Actualizar receta existente
        await db.runAsync(
          'UPDATE recipes SET name = ?, ingredients = ?, instructions = ?, prep_time_minutes = ? WHERE id = ?;',
          [name, ingredients, instructions, timeVal, recipeId]
        );
        Alert.alert('Éxito', 'Receta actualizada correctamente');
      } else {
        // Crear receta nueva
        await db.runAsync(
          'INSERT INTO recipes (user_id, name, ingredients, instructions, prep_time_minutes, is_favorite) VALUES (?, ?, ?, ?, ?, 0);',
          [userToken, name, ingredients, instructions, timeVal]
        );
        Alert.alert('Éxito', 'Receta creada correctamente');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar la receta:', error);
      Alert.alert('Error', 'No se pudo guardar la receta.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>{recipeId ? 'Editar Receta' : 'Nueva Receta'}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre de la receta"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Tiempo de preparación (minutos)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={prepTime}
        onChangeText={setPrepTime}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Ingredientes"
        placeholderTextColor="#999"
        multiline
        value={ingredients}
        onChangeText={setIngredients}
      />

      <TextInput
        style={[styles.input, styles.textAreaLarge]}
        placeholder="Instrucciones de preparación"
        placeholderTextColor="#999"
        multiline
        value={instructions}
        onChangeText={setInstructions}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{recipeId ? 'GUARDAR CAMBIOS' : 'CREAR RECETA'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8f9fa', flexGrow: 1 },
  label: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 16, color: '#333' },
  textArea: { height: 90, textAlignVertical: 'top' },
  textAreaLarge: { height: 140, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#9370db', height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#9370db', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});