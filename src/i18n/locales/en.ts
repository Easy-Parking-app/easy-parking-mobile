import type { TranslationKey } from './es';

/**
 * Sigue el formato que produce `npm run translate` desde `es.ts`.
 *
 * Se puede corregir a mano: el script solo rellena las claves que faltan, así
 * que una corrección sobrevive. `--force` sí las reescribe todas.
 *
 * `Partial` a propósito: una clave sin traducir cae al español en tiempo de
 * ejecución, que es mejor que romper la compilación por una cadena nueva.
 * `--check` dice qué falta.
 */
export const en: Partial<Record<TranslationKey, string>> = {
  'tabs.explorar': 'Explore',
  'tabs.reservas': 'Bookings',
  'tabs.favoritos': 'Saved',
  'tabs.perfil': 'Profile',
  'comun.continuar': 'Continue',
  'comun.cancelar': 'Cancel',
  'comun.volver': 'Back',
  'comun.cerrar': 'Close',
  'comun.guardar': 'Save',
  'comun.reintentar': 'Try again',
  'comun.porHora': 'per hour',
  'comun.opcional': 'optional',
  'comun.resultados': '{{count}} results',
  'comun.unResultado': '1 result',
  'explorar.buscar': 'Where do you want to park?',
  'explorar.buscando': 'Searching in {{zona}}',
  'explorar.abreBusqueda': 'Opens search',
  'explorar.quitarZona': 'Clear the search area',
  'explorar.centrar': 'Centre on my location',
  'explorar.filtros': 'Filters',
  'explorar.filtrosActivos': 'Filters · {{count}}',
  'explorar.disponibleAhora': 'Available now',
  'explorar.masCercanos': 'Nearest',
  'explorar.cercanos': 'Parking nearby',
  'explorar.sinResultados': 'No parking found here',
  'explorar.sinResultadosDetalle': 'Try moving the map, or removing a filter.',
  'disponibilidad.disponible': 'Available now',
  'disponibilidad.pocos': 'Few spots left',
  'disponibilidad.lleno': 'Full',
  'mapa.tuUbicacion': 'Your location',
  'mapa.ubicacionElegida': 'Chosen location',
  'mapa.deLaUbicacion': 'Map of the location',
  'favoritos.titulo': 'Saved',
  'favoritos.vacio': "You haven't saved any yet",
  'favoritos.vacioDetalle':
    "Tap the heart on a parking spot and you'll find it here next time.",
};
