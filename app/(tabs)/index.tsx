import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../constants/firebaseConfig';

type UserStats = {
  userId: string;
  totalDistance: number;
};

// 🔹 Lista fixa de utilizadores
const FIXED_USERS = ['Jony', 'Danas', 'Fafa', 'Telmin'];

export default function IndexScreen() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [nextDriver, setNextDriver] = useState<string | null>(null);
  const [totalKm, setTotalKm] = useState<number>(0); // 🔥 Total de KM apenas do utilizador logado

  // 🔹 Carregar o utilizador logado
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(storedUser);
      }
    };
    loadUser();
  }, []);

  // 🔹 Buscar histórico de rotas e calcular km percorridos por utilizador
  useEffect(() => {
    const fetchRoutesData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'historic_routes'));
        let userDistances: Record<string, number> = {};
        let userTotal = 0;

        // 🔹 Processar o histórico
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const distance = data.distance || 0;
          const userId = data.userId || 'Desconhecido';

          if (userId === currentUser) {
            userTotal += distance; // 🔥 Soma apenas os KM do utilizador logado
          }

          userDistances[userId] = (userDistances[userId] || 0) + distance;
        });

        // 🔹 Criar lista formatada com usuários fixos
        const formattedUserStats = FIXED_USERS.map((userId) => ({
          userId,
          totalDistance: userDistances[userId] || 0,
        }));

        setUserStats(formattedUserStats);
        setTotalKm(userTotal); // 🔥 Define apenas os KM do utilizador logado

        // 🔥 Determinar quem tem menos KM e deve levar o carro
        const next = formattedUserStats.reduce((prev, curr) => 
          curr.totalDistance < prev.totalDistance ? curr : prev, 
          formattedUserStats[0]
        );

        setNextDriver(next.userId);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    };

    if (currentUser) {
      fetchRoutesData();
    }
  }, [currentUser]);

  // 🔹 Função de logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('currentUser'); // Remove o login do AsyncStorage
      router.replace('/loginScreen'); // Redireciona para a tela de login
    } catch (error) {
      console.error('Erro ao fazer logout', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          👋 Bem-vindo, <Text style={{ fontWeight: 'bold', color: '#007AFF' }}>
            {currentUser || 'Utilizador'}
          </Text>!
        </Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* 🔥 Card principal: Quem deve levar o carro */}
      <View style={styles.nextDriverCard}>
        <Text style={styles.nextDriverText}>🚗 Próximo a levar o carro:</Text>
        <Text style={styles.nextDriverName}>{nextDriver || 'Desconhecido'}</Text>
      </View>

      {/* 🔹 Dashboard de Total de KM (agora mostra apenas do user logado) */}
      <View style={styles.dashboard}>
        <Text style={styles.dashboardTitle}>📊 Seus KM Percorridos</Text>
        <Text style={styles.dashboardValue}>{totalKm} km</Text>
      </View>

      {/* 🔹 Lista de utilizadores e seus KM */}
      <FlatList
        data={userStats}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userEmoji}>👤</Text>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.userId}</Text>
              <Text style={styles.userKm}>🛣️ {item.totalDistance} km</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9534f',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 16,
  },
  nextDriverCard: {
    backgroundColor: '#34C759', // Verde para destaque
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  nextDriverText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextDriverName: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 5,
  },
  dashboard: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  dashboardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dashboardValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  userEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userKm: {
    fontSize: 16,
    color: '#555',
  },
});

