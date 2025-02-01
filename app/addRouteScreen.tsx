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

      Alert.alert('Sucesso', 'Rota adicionada ao histórico!');
      router.push('/historyScreen');
    } catch (error) {
      console.error('Erro ao adicionar ao histórico:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a rota ao histórico.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecionar uma Rota</Text>

      {routes.length === 0 ? (
        <Text style={styles.emptyMessage}>Nenhuma rota disponível</Text>
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
              <Text style={styles.routeText}>{item.name}</Text>
              <Text style={styles.routeSubtext}>Distância: {item.distance} km</Text>
              <AntDesign name="right" size={20} color="#007AFF" style={styles.icon} />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
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
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  routeSubtext: {
    fontSize: 14,
    color: 'gray',
  },
  icon: {
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
