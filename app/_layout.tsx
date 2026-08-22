import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { motion, palette } from '@/constants/theme';

/**
 * Root navigator.
 *
 * Everything that is a *destination* lives in the tabs; everything that is a
 * *task* (search, filters, booking, checkout) is pushed or presented modally on
 * top, so the driver never loses the map.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palette.bg },
            animationDuration: motion.duration.slow,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="buscar"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="filtros"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="parqueadero/[id]" />
          <Stack.Screen name="reservar/[id]" />
          <Stack.Screen name="checkout" />
          <Stack.Screen
            name="confirmacion"
            options={{ animation: 'fade', gestureEnabled: false }}
          />
          <Stack.Screen name="reserva/[id]" />
          <Stack.Screen name="configuracion" />
          <Stack.Screen name="propietario" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
