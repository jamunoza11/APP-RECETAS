// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getDatabase } from '../database/db'; // Ajusta la ruta a tu base de datos

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Campos incompletos', 'Por favor llena todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      const db = await getDatabase();
      
      // Guardamos el usuario físicamente en SQLite
      await db.runAsync(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?);',
        [name, email, password]
      );

      setLoading(false);
      Alert.alert(
        'Registro Exitoso', 
        'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      setLoading(false);
      console.error('Error al registrar usuario en SQLite:', error);
      Alert.alert('Error', 'No se pudo registrar el usuario. Es posible que el correo ya esté registrado.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta 📝</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Registrarse'}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backLink} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: '#333' },
  input: { height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 16, marginBottom: 16, backgroundColor: '#f9f9f9' },
  button: { height: 50, backgroundColor: '#20b2aa', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 8 },
  buttonDisabled: { backgroundColor: '#80e5e0' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backLink: { marginTop: 20, alignItems: 'center' },
  backText: { color: '#666', fontSize: 14 },
  linkBold: { color: '#20b2aa', fontWeight: 'bold' }
});