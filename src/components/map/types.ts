import type { StyleProp, ViewStyle } from 'react-native';

import type { LatLng } from '@/types';

export type MapMarker = {
  id: string;
  coordinate: LatLng;
  /** COP per hour, rendered inside the pill. */
  price: number;
  unavailable?: boolean;
  label: string;
};

/**
 * The contract every map implementation must satisfy.
 *
 * Today `MapCanvas` draws an abstract city. Swapping in Google Maps or MapLibre
 * means writing a second component with this same signature and changing the
 * export in `index.ts` — no screen changes.
 */
export type MapViewProps = {
  markers: MapMarker[];
  selectedId: string | null;
  onSelectMarker: (id: string | null) => void;
  /** The driver's own position. */
  userLocation: LatLng;
  /** Where the viewport should settle. Defaults to `userLocation`. */
  focus?: LatLng | null;
  /** Extra bottom inset so markers are not hidden behind a sheet. */
  bottomInset?: number;
  /** Extra top inset so markers are not hidden behind floating controls. */
  topInset?: number;
  interactive?: boolean;
  /**
   * Tocar el mapa devuelve la coordenada tocada.
   *
   * Lo usa el asistente de publicación para colocar el punto del parqueadero.
   * Es opcional porque la pantalla principal no lo necesita: allí un toque en
   * el mapa solo deselecciona.
   */
  onPressCoordinate?: (coordinate: LatLng) => void;
  /**
   * Punto suelto, sin precio ni selección: el sitio que alguien está eligiendo.
   *
   * Distinto de `markers`, que son parqueaderos publicados y se pintan como
   * píldoras de precio. Aquí todavía no hay precio que mostrar.
   */
  pin?: LatLng | null;
  /**
   * Dibujar el punto del conductor. Se apaga cuando el mapa no habla de dónde
   * está el conductor sino de dónde está otra cosa —elegir la ubicación de un
   * parqueadero, por ejemplo—, donde ese punto solo confunde.
   */
  showsUser?: boolean;
  style?: StyleProp<ViewStyle>;
};
