import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';

const MapScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = params.type as string; // "origin" ou "destination"

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const handlePress = (e: MapPressEvent) => {
    const coords = e.nativeEvent.coordinate;
    setLocation({ latitude: coords.latitude, longitude: coords.longitude });
  };

  const saveLocation = () => {
    if (!location) {
      Alert.alert("Erro", "Escolhe um local no mapa antes de guardar.");
      return;
    }
  
    // Atualiza os parâmetros e volta para a tela anterior
    router.replace({
      pathname: "/addRouteScreen",
      params: {
        ...params, // 🛠 Mantém os parâmetros anteriores (não sobrescreve)
        [type]: `${location.latitude},${location.longitude}`
      }
    });
  };
 
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onPress={handlePress}
      >
        {location && <Marker coordinate={location} />}
      </MapView>

      {/* Só mostra o botão quando a localização for selecionada */}
      {location && (
        <View style={styles.buttonContainer}>
          <Button title="Confirmar Localização" onPress={saveLocation} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
  },
});

export default MapScreen;
