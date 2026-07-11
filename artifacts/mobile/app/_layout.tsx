import React, { useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import {
  Lora_400Regular,
  Lora_400Regular_Italic,
  Lora_700Bold,
} from '@expo-google-fonts/lora';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { BibleProvider } from '@/context/BibleContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AudioProvider } from '@/context/AudioContext';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Soft, Apple Books-style veil shown briefly while a Reading Atmosphere swap
// is in flight, so the instant color change underneath never flashes.
function AtmosphereTransitionOverlay() {
  const { transitionOpacity, transitionColor } = useTheme();
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: transitionColor, opacity: transitionOpacity, zIndex: 999 },
      ]}
    />
  );
}

function RootLayoutNav() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerBackTitle: 'Voltar' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="chapter"
          options={{ headerShown: true, presentation: 'card', headerBackTitle: 'Voltar' }}
        />
        <Stack.Screen
          name="daily"
          options={{ headerShown: false, presentation: 'modal' }}
        />
        <Stack.Screen
          name="auth"
          options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
      <AtmosphereTransitionOverlay />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Lora_400Regular,
    Lora_400Regular_Italic,
    Lora_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#F7F3EC', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', gap: 10 }}>
            <View style={{ width: 60, height: 60, borderRadius: 14, backgroundColor: '#1B3A6B', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 32, height: 32, borderRadius: 4, borderWidth: 3, borderColor: '#6B1E2A', borderBottomColor: 'transparent', transform: [{ rotate: '45deg' }] }} />
            </View>
            <View style={{ width: 100, height: 3, borderRadius: 2, backgroundColor: '#E8E4DC', overflow: 'hidden' }}>
              <View style={{ width: '60%', height: '100%', backgroundColor: '#1B3A6B', borderRadius: 2 }} />
            </View>
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <LanguageProvider>
                <ThemeProvider>
                  <BibleProvider>
                    <AudioProvider>
                      <RootLayoutNav />
                    </AudioProvider>
                  </BibleProvider>
                </ThemeProvider>
              </LanguageProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
