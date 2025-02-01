import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, 
  StyleSheet, Platform 
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../constants/firebaseConfig';
import { AntDesign } from '@expo/vector-icons';

export default function RegisterCarScreen() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');

  useEffect(() => {
    const loadCurrentUser = async () => {
      const storedUser = await AsyncStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(storedUser);
      }
    };
    loadCurrentUser();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para escolher uma foto.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const uploadImageToFirebase = async (localUri: string | null) => {
    if (!localUri) return null;

    try {
      setIsUploading(true);
      const response = await fetch(localUri);
      const blob = await response.blob();
      const filename = `cars/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      setIsUploading(false);
      return downloadURL;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      Alert.alert('Erro', 'Falha ao enviar imagem. Verifica a tua internet e as regras do Firebase.');
      setIsUploading(false);
      return null;
    }
  };

  const saveCar = async () => {
    if (!brand.trim() || !model.trim() || !licensePlate.trim() || !photo) {
      Alert.alert('Erro', 'Preenche todos os campos!');
      return;
    }

    setIsUploading(true);
    let imageUrl = await uploadImageToFirebase(photo);

    if (!imageUrl) {
      setIsUploading(false);
      Alert.alert('Erro', 'Não foi possível salvar a imagem.');
      return;
    }

    const newCar = { brand, model, licensePlate, photo: imageUrl, owner: currentUser };

    try {
      await addDoc(collection(db, 'cars'), newCar);
      setIsUploading(false);
      Alert.alert('Sucesso', 'Carro adicionado com sucesso!');
      router.replace('/explore');
    } catch (error) {
      setIsUploading(false);
      Alert.alert('Erro', 'Não foi possível adicionar o carro.');
      console.error(error);
    }
  };

  return (
    <View style={styles.safeContainer}>
      <Text style={styles.title}>Adicionar Carro</Text>
      
      <View style={styles.formContainer}>
        <TextInput 
          style={styles.input} 
          placeholder="Marca" 
          value={brand} 
          onChangeText={setBrand} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Modelo" 
          value={model} 
          onChangeText={setModel} 
        />
        <TextInput 
          style={styles.input} 
          placeholder="Matrícula" 
          value={licensePlate} 
          onChangeText={setLicensePlate} 
        />

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <AntDesign name="camera" size={24} color="white" />
          <Text style={styles.imagePickerText}>
            {photo ? 'Alterar Foto' : 'Escolher Foto'}
          </Text>
        </TouchableOpacity>

        {photo && <Image source={{ uri: photo }} style={styles.previewImage} />}

        <TouchableOpacity style={styles.saveButton} onPress={saveCar} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Carro</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  formContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#28A745',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
