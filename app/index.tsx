import { Redirect } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const userLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(userLoggedIn === 'true');
    };
    checkLogin();
  }, []);

  if (isLoggedIn === null) {
    return <View><Text>Carregando...</Text></View>;
  }

  return isLoggedIn ? <Redirect href="/explore" /> : <Redirect href="/loginScreen" />;
}
