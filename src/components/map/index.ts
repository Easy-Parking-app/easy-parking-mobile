/**
 * Abstracción del mapa.
 *
 * `MapView` es el único símbolo que importan las pantallas. Qué mapa se sirve
 * —el real de Google en móvil, el dibujado en web— lo decide `MapViewImpl`,
 * que Metro resuelve por extensión de plataforma.
 *
 * Cambiar de proveedor es escribir un componente que cumpla `MapViewProps` y
 * tocar ese alias. Ninguna pantalla se entera.
 */
export { MapView } from './MapViewImpl';
export { MapStatic } from './MapStatic';
export { PlacePin } from './PlacePin';
export type { MapMarker, MapViewProps } from './types';
