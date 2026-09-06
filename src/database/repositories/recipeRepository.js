// src/database/repositories/recipeRepository.js
import { getDatabase } from '../db';

// Obtener todas las recetas locales
export const getLocalRecipes = async () => {
  const db = await getDatabase();
  const allRows = await db.getAllAsync('SELECT * FROM recipes ORDER BY id DESC;');
  return allRows;
};

// Insertar o actualizar receta localmente
export const saveRecipeLocal = async (recipe, syncStatus = 'synced') => {
  const db = await getDatabase();
  const updatedAt = new Date().toISOString();
  
  await db.runAsync(
    `INSERT OR REPLACE INTO recipes (remote_id, name, ingredients, instructions, prep_time_minutes, sync_status, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      recipe.id || null,
      recipe.name,
      JSON.stringify(recipe.ingredients || []),
      recipe.instructions || '',
      recipe.prepTimeMinutes || 0,
      syncStatus,
      updatedAt
    ]
  );
};

// Eliminar receta local
export const deleteRecipeLocal = async (id) => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM recipes WHERE id = ?;', [id]);
};