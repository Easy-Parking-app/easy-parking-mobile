/**
 * Abstracción del mapa — implementación web.
 *
 * `react-native-maps` es solo nativo: importarlo en el bundle de web lo rompe.
 * Aquí se sirve el mapa dibujado, que no consume ninguna API y funciona en
 * cualquier navegador.
 *
 * No es un parche: la web sigue siendo la superficie de QA rápida —abrir,
 * mirar, iterar sin recompilar— y para eso el mapa dibujado sobra. El día que
 * la web deje de ser secundaria, aquí entra la librería de Google para
 * navegador y las pantallas siguen sin cambiar.
 */
export { MapCanvas as MapView } from './MapCanvas';
export { MapStatic } from './MapStatic';
export type { MapMarker, MapViewProps } from './types';
