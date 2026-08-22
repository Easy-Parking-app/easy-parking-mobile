/**
 * Map abstraction.
 *
 * `MapView` is the only symbol screens import. Today it is the drawn mock; to
 * ship real tiles, point this alias at a provider-backed implementation that
 * satisfies `MapViewProps`.
 */
export { MapCanvas as MapView } from './MapCanvas';
export { MapStatic } from './MapStatic';
export type { MapMarker, MapViewProps } from './types';
