import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Impede o Splash Screen de fechar antes dos assets carregarem
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Login antes das Tabs */}
        <Stack.Screen name="login" options={{ title: "Login", headerShown: false }} />

        {/* As Tabs principais */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Outras telas */}
        <Stack.Screen name="registercarScreen" options={{ title: "Registar Carro" }} />
        <Stack.Screen name="historyScreen" options={{ title: "Histórico" }} />

        {/* Tela para Not Found */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
