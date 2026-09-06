// src/screens/RecipeFormScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getDatabase } from '../database/db';
import { AuthContext } from '../context/AuthContext';

export default function RecipeFormScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [prepTime, setPrepTime] = useState('');

  const handleSave = async () => {
    if (!name || !ingredients || !instructions) {
      Alert.alert('Error', 'Por favor llena los campos obligatorios');
      return;
    }

    try {
      const db = await getDatabase();
      
      // Inserción incluyendo el user_id y la columna prep_time_minutes correcta
      await db.runAsync(
        'INSERT INTO recipes (user_id, name, ingredients, instructions, prep_time_minutes) VALUES (?, ?, ?, ?, ?);',
        [userToken, name, ingredients, instructions, prepTime ? parseInt(prepTime) : 0]
      );

      Alert.alert('Éxito', 'Receta guardada correctamente');
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar la receta en SQLite:', error);
      Alert.alert('Error', 'No se pudo guardar la receta en la base de datos.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre de la Receta</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. Tacos al pastor"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Ingredientes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Lista los ingredientes..."
        multiline
        value={ingredients}
        onChangeText={setIngredients}
      />

      <Text style={styles.label}>Instrucciones</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Pasos de preparación..."
        multiline
        value={instructions}
        onChangeText={setInstructions}
      />

      <Text style={styles.label}>Tiempo de Preparación (minutos)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 30"
        keyboardType="numeric"
        value={prepTime}
        onChangeText={setPrepTime}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar Receta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#f9f9f9', fontSize: 16 },
  textArea: { height: 90, textAlignVertical: 'top' },
  button: { backgroundColor: '#ff6347', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});