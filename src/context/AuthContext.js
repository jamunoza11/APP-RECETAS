// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { getDatabase } from '../database/db'; // Ajusta la ruta a tu base de datos SQLite

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Restaurar sesión al iniciar la aplicación
  useEffect(() => {
    const bootstrapAsync = async () => {
      let token = null;
      try {
        token = await SecureStore.getItemAsync('user_token');
        if (token) {
          setUserToken(token);
          await fetchUserInfo(token);
        }
      } catch (e) {
        console.error('Error al restaurar el token', e);
      }
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const fetchUserInfo = async (token) => {
    try {
      const db = await getDatabase();
      // Buscamos al usuario en SQLite usando el ID guardado en el token
      const user = await db.getFirstAsync('SELECT * FROM users WHERE id = ?;', [token]);
      if (user) {
        setUserInfo(user);
      }
    } catch (error) {
      console.error('No se pudo obtener la información del usuario desde SQLite', error);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const db = await getDatabase();
      
      // Consultamos si existe el usuario con esas credenciales en SQLite
      const user = await db.getFirstAsync(
        'SELECT * FROM users WHERE email = ? AND password = ?;',
        [email, password]
      );

      if (!user) {
        throw new Error('Correo o contraseña incorrectos.');
      }

      // Usamos el ID del usuario como token de sesión local
      const tokenValue = String(user.id);

      await SecureStore.setItemAsync('user_token', tokenValue);
      setUserToken(tokenValue);
      setUserInfo(user);
    } catch (error) {
      Alert.alert('Error de Inicio de Sesión', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await SecureStore.deleteItemAsync('user_token');
      setUserToken(null);
      setUserInfo(null);
    } catch (e) {
      console.error('Error al cerrar sesión', e);
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ isLoading, userToken, userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};