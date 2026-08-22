import { Linking, Platform } from 'react-native';

import type { NavigationApp } from '@/store/useSettingsStore';
import type { LatLng } from '@/types';

/** Deep link de indicaciones hacia un punto, según la app elegida en Configuración. */
export function directionsUrl(app: NavigationApp, to: LatLng, label?: string): string {
  const coords = `${to.latitude},${to.longitude}`;

  switch (app) {
    case 'waze':
      return `https://waze.com/ul?ll=${coords}&navigate=yes`;
    case 'apple':
      return `https://maps.apple.com/?daddr=${coords}${label ? `&q=${encodeURIComponent(label)}` : ''}`;
    case 'google':
    default:
      return `https://www.google.com/maps/dir/?api=1&destination=${coords}`;
  }
}

/**
 * Abre las indicaciones. Devuelve `false` si el sistema no puede manejar el
 * enlace, para que la pantalla pueda avisar en vez de fallar en silencio.
 */
export async function openDirections(
  app: NavigationApp,
  to: LatLng,
  label?: string,
): Promise<boolean> {
  const url = directionsUrl(app, to, label);

  try {
    if (Platform.OS === 'web') {
      // `Linking.openURL` en web abre una pestaña nueva.
      await Linking.openURL(url);
      return true;
    }
    const supported = await Linking.canOpenURL(url);
    if (!supported) return false;
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
