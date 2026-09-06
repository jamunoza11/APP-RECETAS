// src/screens/RecipesListScreen.js
import React, { useState, useCallback, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDatabase } from '../database/db';
import { AuthContext } from '../context/AuthContext';

export default function RecipesListScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'favorites', 'quick'
  const { userToken } = useContext(AuthContext);

  const loadRecipes = async () => {
    try {
      const db = await getDatabase();
      let query = 'SELECT * FROM recipes WHERE user_id = ?';
      let params = [userToken];

      if (activeFilter === 'favorites') {
        query += ' AND is_favorite = 1';
      } else if (activeFilter === 'quick') {
        query += ' AND prep_time_minutes <= 15'; // Recetas rápidas de 15 min o menos
      }

      query += ' ORDER BY id DESC;';
      const rows = await db.getAllAsync(query, params);
      setRecipes(rows);
    } catch (error) {
      console.error('Error al cargar recetas:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [userToken, activeFilter])
  );

  // Filtrado en tiempo real por nombre o ingredientes
  const filteredRecipes = recipes.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.ingredients && item.ingredients.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleFavorite = async (recipeId, currentFav, event) => {
    event.stopPropagation(); // Evita que abra el detalle al tocar el corazón
    try {
      const db = await getDatabase();
      const newFav = currentFav === 1 ? 0 : 1;
      await db.runAsync('UPDATE recipes SET is_favorite = ? WHERE id = ?;', [newFav, recipeId]);
      loadRecipes();
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabecera con tono morado claro */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Recetas</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda en tiempo real */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o ingrediente..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filtros rápidos horizontales */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>Todas</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterChip, activeFilter === 'favorites' && styles.filterChipActive]}
          onPress={() => setActiveFilter('favorites')}
        >
          <Text style={[styles.filterText, activeFilter === 'favorites' && styles.filterTextActive]}>Favoritas ❤️</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterChip, activeFilter === 'quick' && styles.filterChipActive]}
          onPress={() => setActiveFilter('quick')}
        >
          <Text style={[styles.filterText, activeFilter === 'quick' && styles.filterTextActive]}>Rápidas ⏱️ (≤15m)</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Lista de Recetas */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.recipeTitle}>{item.name}</Text>
              <TouchableOpacity onPress={(e) => toggleFavorite(item.id, item.is_favorite, e)}>
                <Text style={styles.favIcon}>{item.is_favorite === 1 ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>

            <Text numberOfLines={2} style={styles.recipeDesc}>{item.instructions}</Text>

            {/* Píldoras de información / Tiempo */}
            <View style={styles.cardFooter}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>⏱️ {item.prep_time_minutes || 15} min</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍲</Text>
            <Text style={styles.emptyTitle}>No hay recetas disponibles</Text>
            <Text style={styles.emptySubtitle}>Crea una nueva receta o cambia los filtros de búsqueda.</Text>
          </View>
        }
      />

      {/* Botón flotante inferior para crear */}
      <View style={styles.footerButtonContainer}>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => navigation.navigate('RecipeForm')}
        >
          <Text style={styles.createButtonText}>+ CREAR NUEVA RECETA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { 
    backgroundColor: '#b19cd9', // Morado claro elegante
    paddingTop: 50, 
    paddingBottom: 16, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 4
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  settingsButton: { padding: 4 },
  settingsIcon: { fontSize: 22 },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#eee',
    height: 46
  },
  searchIcon: { marginRight: 8, fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },

  filtersContainer: {
    paddingHorizontal: 16,
    marginVertical: 12,
    maxHeight: 40
  },
  filterChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 36,
    justifyContent: 'center'
  },
  filterChipActive: {
    backgroundColor: '#9370db', // Morado activo
    borderColor: '#9370db'
  },
  filterText: { color: '#666', fontSize: 13, fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },

  listContainer: { paddingHorizontal: 16, paddingBottom: 80 },
  card: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 14, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recipeTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', flex: 1 },
  favIcon: { fontSize: 20 },
  recipeDesc: { fontSize: 14, color: '#7f8c8d', marginTop: 6, lineHeight: 20 },
  
  cardFooter: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  badge: { backgroundColor: '#f0ebf8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, color: '#7b68ee', fontWeight: '600' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 50, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#444' },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 6 },

  footerButtonContainer: { 
    position: 'absolute', 
    bottom: 16, 
    left: 16, 
    right: 16 
  },
  createButton: { 
    height: 52, 
    backgroundColor: '#ff7f50', // Tono coral vibrante que combina perfecto con el morado
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 14, 
    shadowColor: '#ff7f50', 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 4 
  },
  createButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.5 }
});