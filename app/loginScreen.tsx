import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Lista de utilizadores fixos
const fixedUsers = [
  { username: 'Jony', password: '1234' },
  { username: 'Fafa', password: '1234' },
  { username: 'Danas', password: '1234' },
  { username: 'Telmin', password: '1234' }
];

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => { // ADICIONA `async` AQUI
    const userExists = fixedUsers.find(
      (user) => user.username === username && user.password === password
    );

    if (userExists) {
      await AsyncStorage.setItem('currentUser', username); 
      router.replace('/explore'); // Redireciona para as Tabs
    } else {
      Alert.alert('Erro', 'Utilizador ou senha inválidos!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome de utilizador"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Entrar" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
});
