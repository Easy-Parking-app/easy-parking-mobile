import type { Suggestion } from '@/types';

/** Bogotá zones offered before the driver types anything. */
export const zoneSuggestions: Suggestion[] = [
  {
    id: 'zn-chapinero',
    label: 'Chapinero',
    detail: 'Carrera 7 · Zona de bares y oficinas',
    coordinate: { latitude: 4.6486, longitude: -74.0628 },
    kind: 'zona',
  },
  {
    id: 'zn-zona-t',
    label: 'Zona T',
    detail: 'Calle 82 · Restaurantes y comercio',
    coordinate: { latitude: 4.6668, longitude: -74.0537 },
    kind: 'zona',
  },
  {
    id: 'zn-chico',
    label: 'Chicó',
    detail: 'Calle 85 · Parque El Virrey',
    coordinate: { latitude: 4.6721, longitude: -74.0521 },
    kind: 'zona',
  },
  {
    id: 'zn-93',
    label: 'Parque de la 93',
    detail: 'Carrera 12 · Gastronomía',
    coordinate: { latitude: 4.6765, longitude: -74.0483 },
    kind: 'zona',
  },
  {
    id: 'zn-usaquen',
    label: 'Usaquén',
    detail: 'Carrera 6 · Plaza y mercado',
    coordinate: { latitude: 4.695, longitude: -74.0305 },
    kind: 'zona',
  },
  {
    id: 'zn-cedritos',
    label: 'Cedritos',
    detail: 'Calle 140 · Zona residencial',
    coordinate: { latitude: 4.7212, longitude: -74.0397 },
    kind: 'zona',
  },
  {
    id: 'zn-salitre',
    label: 'Salitre',
    detail: 'Avenida El Dorado · Empresarial',
    coordinate: { latitude: 4.6577, longitude: -74.1108 },
    kind: 'zona',
  },
  {
    id: 'zn-centro',
    label: 'Centro Internacional',
    detail: 'Carrera 10 · Museos y trámites',
    coordinate: { latitude: 4.6152, longitude: -74.0699 },
    kind: 'zona',
  },
  {
    id: 'zn-teusaquillo',
    label: 'Teusaquillo',
    detail: 'Calle 34 · Universidad Nacional',
    coordinate: { latitude: 4.6317, longitude: -74.0722 },
    kind: 'zona',
  },
];

/** Seed for the "Recientes" list on first launch. */
export const recentSearches: Suggestion[] = [
  {
    id: 'rc-1',
    label: 'Zona T',
    detail: 'Buscado hace 2 días',
    coordinate: { latitude: 4.6668, longitude: -74.0537 },
    kind: 'reciente',
  },
  {
    id: 'rc-2',
    label: 'Calle 85 con 15',
    detail: 'Buscado la semana pasada',
    coordinate: { latitude: 4.6702, longitude: -74.0533 },
    kind: 'reciente',
  },
];
