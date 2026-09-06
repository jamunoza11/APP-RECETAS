// App.js
import React, { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { initDatabase } from './src/database/db';

export default function App() {
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        console.log('Base de datos inicializada con éxito');
      } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
      }
    };

    setupDatabase();
  }, []);

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}