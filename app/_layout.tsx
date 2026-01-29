import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { AlarmProvider } from '@/context/AlarmContext';
import { AudioSelectionProvider } from '@/context/AudioSelectionContext';
import { AuthProvider } from '@/context/AuthContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { initializeNotifications, requestNotificationPermissions } from '@/services/alarmScheduler';
import { initializeSuperwall } from '@/services/superwall';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

// Custom light theme based on RiseAlarm design specs
const RiseAlarmTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.card,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.primary,
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Quicksand-Regular': Quicksand_400Regular,
    'Quicksand-Medium': Quicksand_500Medium,
    'Quicksand-SemiBold': Quicksand_600SemiBold,
    'Quicksand-Bold': Quicksand_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Initialize notifications on startup
  useEffect(() => {
    const setupNotifications = async () => {
      await initializeNotifications();
      await requestNotificationPermissions();
    };
    setupNotifications();
  }, []);

  // Initialize Superwall for paywall management
  useEffect(() => {
    initializeSuperwall();
  }, []);

  // Don't render until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SubscriptionProvider>
          <AlarmProvider>
            <AudioSelectionProvider>
              <ThemeProvider value={RiseAlarmTheme}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="onboarding"
                    options={{
                      headerShown: false,
                      animation: 'fade',
                    }}
                  />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="auth"
                    options={{
                      headerShown: false,
                      animation: 'slide_from_right',
                    }}
                  />
                  <Stack.Screen
                    name="new-alarm"
                    options={{
                      presentation: 'modal',
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                  <Stack.Screen
                    name="paywall"
                    options={{
                      headerShown: false,
                      animation: 'fade',
                    }}
                  />
                  <Stack.Screen
                    name="legal"
                    options={{
                      headerShown: false,
                      animation: 'slide_from_right',
                    }}
                  />
                </Stack>
                <StatusBar style="dark" />
              </ThemeProvider>
            </AudioSelectionProvider>
          </AlarmProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
