import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../constants/firebaseConfig';

const HistoryScreen = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          setUserName(storedUser);
          fetchRoutes(storedUser);
        }
      } catch (error) {
        console.error('Erro ao obter o nome do utilizador:', error);
      }
    };

    const fetchRoutes = async (user: string) => {
      try {
        const q = query(collection(db, 'historic_routes'), where('userId', '==', user));
        const querySnapshot = await getDocs(q);
        const routesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoutes(routesList);

        // Animação de fade-in ao carregar os dados
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Erro ao buscar rotas:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.safeContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico de Rotas</Text>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.7} style={styles.routeCard}>
              <View style={styles.routeInfo}>
                <Text style={styles.routeTitle}>{item.name}</Text>
                <View style={styles.detailsRow}>
                  <MaterialIcons name="location-on" size={18} color="#007AFF" />
                  <Text style={styles.routeSubtext}>{item.distance} km</Text>
                </View>
                <View style={styles.detailsRow}>
                  <MaterialIcons name="schedule" size={18} color="#007AFF" />
                  <Text style={styles.routeSubtext}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.emptyMessage}>Nenhuma rota encontrada.</Text>}
        />
      </Animated.View>

      {/* Floating Action Button - Modernizado */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/addRouteScreen')}>
        <AntDesign name="plus" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: '#F4F4F4', // 🔹 Fundo cinza claro para destacar os cartões
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  routeCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4, // 🔹 Barra lateral para estilo moderno
    borderLeftColor: '#007AFF',
  },
  routeInfo: {
    flexDirection: 'column',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  routeSubtext: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    backgroundColor: '#007AFF',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});

export default HistoryScreen;
