// src/screens/FavoritesScreen.js
import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDatabase } from '../database/db';
import { AuthContext } from '../context/AuthContext';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const { userToken } = useContext(AuthContext);

  const loadFavorites = async () => {
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync('SELECT * FROM recipes WHERE user_id = ? AND is_favorite = 1;', [userToken]);
      setFavorites(rows);
    } catch (error) {
      console.error('Error al cargar favoritas:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [userToken])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.recipeTitle}>{item.name}</Text>
              <Text style={styles.favIcon}>❤️</Text>
            </View>
            <Text numberOfLines={2} style={styles.recipeDesc}>{item.instructions}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tienes recetas marcadas como favoritas.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recipeTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },
  favIcon: { fontSize: 20 },
  recipeDesc: { fontSize: 14, color: '#666', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
});