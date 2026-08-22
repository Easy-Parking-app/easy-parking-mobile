import { Stack } from 'expo-router';

import { motion, palette } from '@/constants/theme';

/** Owner mode is a stack, not a second tab bar — it is a place you go into. */
export default function OwnerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.bg },
        animationDuration: motion.duration.slow,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="publicar" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="reservas" />
      <Stack.Screen name="ingresos" />
    </Stack>
  );
}
