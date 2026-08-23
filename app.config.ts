import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Config dinámica de Expo.
 *
 * `app.json` sigue siendo la fuente de todo lo estático; este archivo solo le
 * inyecta lo que depende del entorno. Las claves de Google Maps tienen que
 * llegar al binario nativo (el SDK las lee del manifest de Android y del
 * Info.plist de iOS), pero no pueden quedar escritas en un archivo versionado
 * —de ahí que `app.json` no sirva y esto sí—.
 *
 * Sin `.env.local` las claves quedan en `undefined` y el mapa nativo no carga;
 * el resto de la app funciona igual. Ver `.env.example`.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Easy Parking',
  slug: config.slug ?? 'easy-parking',
  ios: {
    ...config.ios,
    config: {
      ...config.ios?.config,
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_IOS,
    },
  },
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID,
      },
    },
  },
});
