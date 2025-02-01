import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, Alert, TouchableOpacity 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig'; 
import { AntDesign } from '@expo/vector-icons';

type Route = {
  id: string;
  name: string;
  distance: number;
  userId: string;
};

export default function AddRouteScreen() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // 🔹 Buscar o utilizador logado
  useEffect(() => {
    const loadCurrentUser = async () => {
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(storedUser);
      }
    };
    loadCurrentUser();
  }, []);

  // 🔹 Carregar as rotas do Firebase (somente do utilizador logado)
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'rotas'));
        const loadedRoutes: Route[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as Route;
          if (data.userId === currentUser) { 
            loadedRoutes.push({ ...data, id: data.id || doc.id });
          }
        });

        setRoutes(loadedRoutes);
      } catch (error) {
        console.error('Erro ao carregar rotas:', error);
      }
    };

    if (currentUser) {
      fetchRoutes();
    }
  }, [currentUser]);

  // 🔹 Guardar rota no histórico (`historic_routes`)
  const addToHistory = async (route: Route) => {
    try {
      await addDoc(collection(db, 'historic_routes'), {
        name: route.name,
        distance: route.distance,
        userId: currentUser,
        timestamp: new Date().toISOString(),
      });

      Alert.alert('Sucesso', '🚀 Rota adicionada ao histórico!');
      router.push('/historyScreen');
    } catch (error) {
      console.error('Erro ao adicionar ao histórico:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a rota ao histórico.');
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔹 Título chamativo */}
      <View style={styles.header}>
        <Text style={styles.title}>Escolha sua Rota</Text>
        <Text style={styles.subtitle}>Selecione uma rota para adicionar ao histórico</Text>
      </View>

      {routes.length === 0 ? (
        <Text style={styles.emptyMessage}>⚠️ Nenhuma rota disponível</Text>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.routeCard} 
              onPress={() => addToHistory(item)}
              activeOpacity={0.7}
            >
              <View style={styles.routeLeft}>
                <AntDesign name="enviromento" size={20} color="#007AFF" style={styles.locationIcon} />
                <Text style={styles.routeText}>{item.name}</Text>
              </View>
              <View style={styles.routeRight}>
                <Text style={styles.routeDistance}>{item.distance} km</Text>
                <Text style={styles.arrow}>{'>'}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Button para adicionar nova rota */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/mapScreen')}
        activeOpacity={0.8}
      >
        <AntDesign name="plus" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: '#F0F4F8', // 🔹 Fundo moderno
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 5,
  },
  emptyMessage: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
  routeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  routeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 8, // 🔹 Ícone da localização próximo ao nome da rota
  },
  routeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  routeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDistance: {
    fontSize: 16,
    color: '#555',
    marginRight: 8, // 🔹 Espaço entre os KM e a seta
  },
  arrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF', // 🔹 Azul para manter a identidade visual
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#007AFF',
    width: 65,
    height: 65,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});

