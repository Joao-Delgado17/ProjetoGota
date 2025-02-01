import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function IndexScreen() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Carregar o utilizador logado
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(storedUser);
      }
    };

    loadUser();
  }, []);

  // Função de logout
  const handleLogout = async () => {
    try {
      // Limpar o nome do utilizador no AsyncStorage
      await AsyncStorage.removeItem('currentUser');
      // Redirecionar para a tela de login
      router.replace('/loginScreen')// Aqui é onde a tela de login está definida
    } catch (error) {
      console.error('Erro ao fazer logout', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bem-vindo, {currentUser || 'Utilizador'}!</Text>
      <Button title="Logout" onPress={handleLogout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
  },
});
