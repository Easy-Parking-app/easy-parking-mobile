/**
 * Implementación de `MapView` para web: el mapa dibujado.
 *
 * `react-native-maps` es solo nativo. Aquí se sirve `MapCanvas`, que no
 * consume ninguna API y funciona en cualquier navegador.
 *
 * No es un parche: la web es la superficie de QA rápida —abrir, mirar, iterar
 * sin recompilar— y para eso el mapa dibujado sobra. El día que la web deje de
 * ser secundaria, aquí entra la librería de Google para navegador y ninguna
 * pantalla cambia.
 */
export { MapCanvas as MapView } from './MapCanvas';
