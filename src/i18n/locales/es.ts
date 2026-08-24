/**
 * Catálogo en español. **Es la fuente de verdad.**
 *
 * Los demás idiomas se generan a partir de este archivo con
 * `npm run translate`, así que aquí se escribe y en los otros no se toca nada a
 * mano: lo que se edite allí se pierde en la siguiente generación.
 *
 * Las claves son planas y con puntos, no objetos anidados. Dos razones: el
 * script de traducción recorre un mapa de cadena a cadena sin tener que
 * entender estructura, y TypeScript puede exigir que toda clave usada exista,
 * porque `keyof` de un objeto plano son literalmente las claves.
 *
 * Convención: `pantalla.elemento`. Lo compartido va en `comun.`.
 *
 * Las interpolaciones usan `{{nombre}}`.
 */
export const es = {
  /* ------------------------------------------------------------- navegación */
  'tabs.explorar': 'Explorar',
  'tabs.reservas': 'Reservas',
  'tabs.favoritos': 'Favoritos',
  'tabs.perfil': 'Perfil',

  /* ------------------------------------------------------------------ común */
  'comun.continuar': 'Continuar',
  'comun.cancelar': 'Cancelar',
  'comun.volver': 'Volver',
  'comun.cerrar': 'Cerrar',
  'comun.guardar': 'Guardar',
  'comun.reintentar': 'Reintentar',
  'comun.porHora': 'por hora',
  'comun.opcional': 'opcional',
  'comun.resultados': '{{count}} resultados',
  'comun.unResultado': '1 resultado',

  /* --------------------------------------------------------------- explorar */
  'explorar.buscar': '¿A dónde quieres parquear?',
  'explorar.buscando': 'Buscando en {{zona}}',
  'explorar.abreBusqueda': 'Abre la búsqueda',
  'explorar.quitarZona': 'Quitar la zona de búsqueda',
  'explorar.centrar': 'Centrar en mi ubicación',
  'explorar.filtros': 'Filtros',
  'explorar.filtrosActivos': 'Filtros · {{count}}',
  'explorar.disponibleAhora': 'Disponible ahora',
  'explorar.masCercanos': 'Más cercanos',
  'explorar.cercanos': 'Parqueaderos cercanos',
  'explorar.sinResultados': 'No encontramos parqueaderos aquí',
  'explorar.sinResultadosDetalle': 'Prueba a mover el mapa o a quitar algún filtro.',

  /* ------------------------------------------------------------- disponibilidad */
  'disponibilidad.disponible': 'Disponible ahora',
  'disponibilidad.pocos': 'Pocos cupos',
  'disponibilidad.lleno': 'Sin cupos',

  /* ----------------------------------------------------------------- mapa */
  'mapa.tuUbicacion': 'Tu ubicación',
  'mapa.ubicacionElegida': 'Ubicación elegida',
  'mapa.deLaUbicacion': 'Mapa de la ubicación',

  /* -------------------------------------------------------------- favoritos */
  'favoritos.titulo': 'Favoritos',
  'favoritos.vacio': 'Todavía no guardas ninguno',
  'favoritos.vacioDetalle':
    'Toca el corazón en un parqueadero y lo encuentras aquí la próxima vez.',
} as const;

export type TranslationKey = keyof typeof es;
