// src/services/syncService.js
import NetInfo from '@react-native-community/netinfo';
import { getDatabase } from '../database/db';

// 1. Verificar si hay conexión a internet
export const checkConnectivity = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected && state.isInternetReachable !== false;
};

// 2. Estrategia "Local Primero": Cargar datos locales y actualizar con API si hay red
export const fetchAndSyncRecipes = async () => {
  const db = await getDatabase();
  
  // Paso A: Leer primero de SQLite (Local primero)
  const localRecipes = await db.getAllAsync('SELECT * FROM recipes ORDER BY id DESC;');

  const isConnected = await checkConnectivity();

  if (isConnected) {
    try {
      // Paso B: Consultar al servidor (DummyJSON /recipes)
      const response = await fetch('https://dummyjson.com/recipes');
      const data = await response.json();

      if (response.ok && data.recipes) {
        // Actualizar base de datos local con los datos remotos frescos
        for (const recipe of data.recipes) {
          await db.runAsync(
            `INSERT OR IGNORE INTO recipes (remote_id, name, ingredients, instructions, prep_time_minutes, sync_status) 
             VALUES (?, ?, ?, ?, ?, 'synced');`,
            [
              recipe.id,
              recipe.name,
              JSON.stringify(recipe.ingredients || []),
              recipe.instructions || '',
              recipe.prepTimeMinutes || 0
            ]
          );
        }
      }
    } catch (error) {
      console.log('No se pudo actualizar con el servidor, usando solo datos locales:', error);
    }
  }

  // Retornar datos actualizados de SQLite
  return await db.getAllAsync('SELECT * FROM recipes ORDER BY id DESC;');
};

// 3. Escritura Offline: Guardar localmente como 'pending' si no hay red y sincronizar al reconectar
export const saveRecipeWithOfflineSupport = async (recipeData) => {
  const db = await getDatabase();
  const isConnected = await checkConnectivity();
  const syncStatus = isConnected ? 'synced' : 'pending';

  try {
    if (isConnected) {
      // Intentar escribir directamente en el servidor (Ejemplo POST /recipes/add)
      const response = await fetch('https://dummyjson.com/recipes/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: recipeData.name,
          ingredients: recipeData.ingredients,
          instructions: recipeData.instructions,
          prepTimeMinutes: recipeData.prepTimeMinutes,
          userId: 1
        }),
      });
      
      if (!response.ok) throw new Error('Error en el servidor remoto');
    }

    // Guardar en SQLite local reflejando el estado correspondiente
    await db.runAsync(
      `INSERT INTO recipes (name, ingredients, instructions, prep_time_minutes, sync_status, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        recipeData.name,
        JSON.stringify(recipeData.ingredients || []),
        recipeData.instructions || '',
        recipeData.prepTimeMinutes || 0,
        syncStatus,
        new Date().toISOString()
      ]
    );

    return { success: true, offline: !isConnected };
  } catch (error) {
    // Si falla el servidor pero hay internet, o si estamos offline, aseguramos guardado local pendiente
    await db.runAsync(
      `INSERT INTO recipes (name, ingredients, instructions, prep_time_minutes, sync_status, updated_at) 
       VALUES (?, ?, ?, ?, 'pending', ?);`,
      [
        recipeData.name,
        JSON.stringify(recipeData.ingredients || []),
        recipeData.instructions || '',
        recipeData.prepTimeMinutes || 0,
        new Date().toISOString()
      ]
    );
    return { success: true, offline: true, error: error.message };
  }
};

// 4. Sincronizar registros pendientes cuando regresa la red
export const syncPendingOperations = async () => {
  const isConnected = await checkConnectivity();
  if (!isConnected) return;

  const db = await getDatabase();
  const pendingRecipes = await db.getAllAsync("SELECT * FROM recipes WHERE sync_status = 'pending';");

  for (const recipe of pendingRecipes) {
    try {
      // Cambiar estado a syncing temporalmente
      await db.runAsync("UPDATE recipes SET sync_status = 'syncing' WHERE id = ?;", [recipe.id]);

      const response = await fetch('https://dummyjson.com/recipes/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: recipe.name,
          ingredients: JSON.parse(recipe.ingredients || '[]'),
          instructions: recipe.instructions,
          prepTimeMinutes: recipe.prep_time_minutes,
          userId: 1
        }),
      });

      if (response.ok) {
        // Si sincronizó con éxito
        await db.runAsync("UPDATE recipes SET sync_status = 'synced' WHERE id = ?;", [recipe.id]);
      } else {
        // Si falló el servidor, marcar como failed para reintento posterior
        await db.runAsync("UPDATE recipes SET sync_status = 'failed' WHERE id = ?;", [recipe.id]);
      }
    } catch (e) {
      await db.runAsync("UPDATE recipes SET sync_status = 'failed' WHERE id = ?;", [recipe.id]);
    }
  }
};