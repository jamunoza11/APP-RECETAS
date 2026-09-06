// src/database/db.js
import * as SQLite from 'expo-sqlite';

let db = null;

export const getDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('recipes.db');
  }
  return db;
};

export const initDatabase = async () => {
  const database = await getDatabase();
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      remote_id INTEGER UNIQUE,
      name TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      prep_time_minutes INTEGER,
      is_favorite INTEGER DEFAULT 0,
      sync_status TEXT DEFAULT 'synced',
      updated_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  console.log('Base de datos y tablas inicializadas con éxito');
};