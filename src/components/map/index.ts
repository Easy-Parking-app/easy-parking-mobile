/**
 * Abstracción del mapa — implementación nativa.
 *
 * `MapView` es el único símbolo que importan las pantallas. En iOS y Android es
 * el mapa real de Google; en web lo resuelve `index.web.ts`, porque
 * `react-native-maps` no soporta web y basta con importarlo para romper el
 * bundle. Metro elige el archivo por extensión de plataforma.
 *
 * Cambiar de proveedor sigue siendo escribir un componente que cumpla
 * `MapViewProps` y tocar este alias. Ninguna pantalla se entera.
 */
export { MapGoogleView as MapView } from './MapGoogleView';
export { MapStatic } from './MapStatic';
export type { MapMarker, MapViewProps } from './types';
