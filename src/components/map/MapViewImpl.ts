/**
 * Implementación de `MapView` para iOS y Android: el mapa real de Google.
 *
 * La elección de plataforma vive aquí, en un módulo minúsculo, y no en
 * `index.ts`, por dos razones:
 *
 * - `MapStatic` también necesita el mapa, y si lo pidiera a `index.ts` —que a
 *   su vez exporta `MapStatic`— habría una importación circular.
 * - `react-native-maps` es solo nativo: basta con importarlo para romper el
 *   bundle de web. Separando el archivo, Metro resuelve `MapViewImpl.web.ts`
 *   allí y nunca llega a mirarlo.
 */
export { MapGoogleView as MapView } from './MapGoogleView';
