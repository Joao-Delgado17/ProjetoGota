import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, Alert, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../constants/firebaseConfig';

type Car = {
  brand: string;
  model: string;
  licensePlate: string;
  photo: string;
  owner: string;
};

function ExploreScreen() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedCars, setSelectedCars] = useState<string[]>([]);

  // Carregar todos os carros do Firebase
  useEffect(() => {
    const loadCars = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'cars'));
        const allCars: Car[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id, // ID do documento
            brand: data.brand || 'Desconhecido',
            model: data.model || 'Desconhecido',
            licensePlate: data.licensePlate || 'Sem matrícula',
            photo: data.photo || '',
            owner: data.owner || 'Desconhecido',
          };
        });
        
        

        setCars(allCars);
      } catch (error) {
        console.error('Erro ao carregar carros do Firebase:', error);
      }
    };

    loadCars();
  }, []);

  // Alternar entre lista normal e modo de exclusão
  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedCars([]); // Resetar seleção de carros
  };

  // Selecionar ou desselecionar um carro para remoção
  const toggleCarSelection = (car: Car) => {
    if (selectedCars.includes(car.licensePlate)) {
      setSelectedCars(selectedCars.filter((plate) => plate !== car.licensePlate));
    } else {
      setSelectedCars([...selectedCars, car.licensePlate]);
    }
  };

  // Excluir carros selecionados
  const deleteSelectedCars = async () => {
    const updatedCars = cars.filter((car) => !selectedCars.includes(car.licensePlate));
    setCars(updatedCars);

    try {
      for (const licensePlate of selectedCars) {
        const querySnapshot = await getDocs(collection(db, 'cars'));
        querySnapshot.forEach(async (docSnapshot) => {
          const data = docSnapshot.data() as Car;
          if (data.licensePlate === licensePlate) {
            const carRef = doc(db, 'cars', docSnapshot.id);
            await deleteDoc(carRef);
          }
        });
      }

      Alert.alert('Sucesso', 'Carros apagados com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível apagar os carros.');
      console.error(error);
    }

    setIsDeleteMode(false);
    setSelectedCars([]);
  };

  return (
    <View style={styles.safeContainer}>
      {/* Header moderno */}
      <View style={styles.header}>
        <Text style={styles.title}>{isDeleteMode ? 'Selecionar Carros' : 'Lista de Carros'}</Text>
        <TouchableOpacity onPress={toggleDeleteMode}>
          <MaterialIcons name={isDeleteMode ? 'cancel' : 'list'} size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Lista de carros */}
      <FlatList
        data={cars}
        keyExtractor={(item, index) => `${item.licensePlate}-${index}`}
        contentContainerStyle={styles.carList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.carCard,
              isDeleteMode && selectedCars.includes(item.licensePlate) ? styles.selectedCard : null,
            ]}
            onPress={() => (isDeleteMode ? toggleCarSelection(item) : null)}
            activeOpacity={isDeleteMode ? 0.7 : 1}
          >
            <Image source={{ uri: item.photo }} style={styles.carImage} />
            <View style={styles.carDetails}>
              <Text style={styles.carText}>{item.brand} {item.model}</Text>
              <Text style={styles.carSubtext}>Matrícula: {item.licensePlate}</Text>
              <Text style={styles.ownerText}>🧑‍✈️ Proprietário: {item.owner}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyMessage}>Nenhum carro disponível.</Text>}
      />

      {/* Floating Button para adicionar novo carro */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('../registerCarScreen')}>
        <AntDesign name="plus" size={30} color="white" />
      </TouchableOpacity>

      {/* Botão de apagar quando no modo de exclusão */}
      {isDeleteMode && selectedCars.length > 0 && (
        <TouchableOpacity style={styles.deleteButton} onPress={deleteSelectedCars}>
          <Text style={styles.deleteButtonText}>Eliminar {selectedCars.length} carro(s)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: '#F4F4F4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#007AFF',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  carList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  carCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#007AFF',
  },
  selectedCard: {
    backgroundColor: '#ffdddd',
  },
  carImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  carDetails: {
    flex: 1,
  },
  carText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  carSubtext: {
    fontSize: 14,
    color: '#666',
  },
  ownerText: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 5,
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
  },
  deleteButton: {
    position: 'absolute',
    bottom: 150,
    left: 20,
    right: 20,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});

export default ExploreScreen;
