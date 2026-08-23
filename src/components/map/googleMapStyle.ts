import { palette } from '@/constants/theme';

/**
 * Estilo del mapa de Google.
 *
 * Dos problemas que resuelve, en este orden:
 *
 * 1. El estilo por defecto de Google es saturado y está lleno de pines de
 *    comercios. Encima de él, nuestras píldoras de precio dejan de destacar y
 *    la pantalla principal pasa a parecerse a cualquier otra app.
 *
 * 2. Desaturarlo hasta el blanco es pasarse de largo: un mapa casi blanco se ve
 *    limpio en una captura y plano en la mano, porque las vías desaparecen
 *    contra el fondo y no queda de dónde agarrarse para orientarse.
 *
 * El punto medio es una ciudad legible: tierra gris azulada, manzanas un
 * escalón más oscuras que dan textura, vías blancas que resaltan por contraste
 * y no por brillo, agua azul de verdad, parques verdes y las vías principales
 * en ámbar suave para dar jerarquía. Poco color, pero colocado donde informa.
 *
 * Los valores salen de `theme.ts`. No se escribe un hex aquí.
 *
 * Referencia del formato:
 * https://developers.google.com/maps/documentation/ios-sdk/styling
 */
export const googleMapStyle = [
  // Base: la tierra. Todo lo demás se pinta encima.
  { elementType: 'geometry', stylers: [{ color: palette.mapLand }] },

  // Etiquetas: gris medio con halo blanco. El halo es lo que las hace legibles
  // sobre las vías sin tener que oscurecer el texto hasta que compita.
  { elementType: 'labels.text.fill', stylers: [{ color: palette.mapLabel }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: palette.bg }] },
  // Los pines de comercios de Google compiten directamente con los nuestros.
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },

  // Manzanas y edificios. Esta es la capa que más hace por que el mapa no se
  // vea vacío: sin ella, entre vía y vía no hay nada.
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{ color: palette.mapLandAlt }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: palette.mapLand }],
  },

  // Fronteras y divisiones administrativas: fuera. Dentro de una ciudad no
  // aportan y ensucian.
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  // El nombre del barrio sí se queda: es como el conductor piensa la ciudad
  // ("Chapinero", "Zona T") y es el vocabulario que usa nuestra búsqueda.
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text',
    stylers: [{ visibility: 'on' }],
  },

  // Puntos de interés: fuera, salvo los parques y el verde grande, que son la
  // mejor referencia visual que tiene alguien orientándose en una ciudad.
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }, { color: palette.mapPark }],
  },
  {
    featureType: 'poi.sports_complex',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }, { color: palette.mapPark }],
  },

  // Vías. La jerarquía va por color, no por grosor: local casi fundida con la
  // tierra, arteria blanca, autopista en ámbar.
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: palette.mapRoad }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: palette.mapRoadMinor }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: palette.mapRoad }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: palette.mapHighway }],
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: palette.mapHighway }],
  },

  // Nombres de calle solo en las vías grandes: en las pequeñas saturan el mapa
  // justo en la zona donde se acumulan los marcadores.
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.arterial', elementType: 'labels.text', stylers: [{ visibility: 'on' }] },
  { featureType: 'road.highway', elementType: 'labels.text', stylers: [{ visibility: 'on' }] },

  // Transporte público: fuera. Quien busca parqueadero llega en carro.
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },

  { featureType: 'water', elementType: 'geometry', stylers: [{ color: palette.mapWater }] },
  { featureType: 'water', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
];
