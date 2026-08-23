import { palette } from '@/constants/theme';

/**
 * Estilo del mapa de Google.
 *
 * El estilo por defecto de Google es saturado y lleno de iconos de comercios;
 * encima de él nuestras píldoras de precio dejan de destacar y la pantalla
 * principal pasa a parecerse a cualquier otra app.
 *
 * Esto lo desatura hasta el mismo lenguaje que ya dibuja `MapBackdrop`: tierra
 * gris muy claro, vías blancas, agua apagada, verde solo en parques y etiquetas
 * discretas. Los colores salen de `theme.ts`, no se escriben aquí.
 *
 * Referencia del formato:
 * https://developers.google.com/maps/documentation/ios-sdk/styling
 */
export const googleMapStyle = [
  // Base: todo gris claro salvo lo que se sobrescriba después.
  { elementType: 'geometry', stylers: [{ color: palette.mapLand }] },

  // Etiquetas: gris medio con halo blanco. El halo es lo que las hace legibles
  // sobre las vías sin tener que oscurecer el texto.
  { elementType: 'labels.text.fill', stylers: [{ color: palette.mapLabel }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: palette.bg }] },
  // Los pines de comercios de Google compiten directamente con los nuestros.
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },

  // Fronteras y divisiones administrativas: fuera. En una ciudad no aportan.
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  // El nombre del barrio sí se queda: es como el conductor piensa la ciudad
  // ("Chapinero", "Zona T") y es el vocabulario que usa nuestra búsqueda.
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text',
    stylers: [{ visibility: 'on' }],
  },

  // Puntos de interés: fuera, salvo los parques, que dan referencia visual.
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }, { color: palette.mapPark }],
  },

  // Vías: blancas, sin contorno. El contraste lo da la tierra gris de debajo.
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: palette.mapRoad }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: palette.mapRoadMinor }],
  },
  // Nombres de calle solo en las vías grandes: en las pequeñas saturan el mapa
  // justo en la zona donde se acumulan los marcadores.
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text',
    stylers: [{ visibility: 'on' }],
  },

  // Transporte público: fuera. Quien busca parqueadero llega en carro.
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },

  { featureType: 'water', elementType: 'geometry', stylers: [{ color: palette.mapWater }] },
  { featureType: 'water', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
];
