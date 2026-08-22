import { parkings, parkingsById } from '@/mocks/parkings';
import { recentSearches, zoneSuggestions } from '@/mocks/suggestions';
import type { Filters, LatLng, Parking, SearchQuery, Suggestion } from '@/types';
import { distanceMeters } from '@/utils/geo';
import { normalizeText as normalize } from '@/utils/text';
import { clone, request, ServiceError } from './client';


function withDistance(list: Parking[], near: LatLng): Parking[] {
  return list.map((parking) => ({
    ...parking,
    distanceMeters: distanceMeters(near, parking.coordinate),
  }));
}

function matchesText(parking: Parking, text: string): boolean {
  if (text.trim().length === 0) return true;
  const needle = normalize(text);
  return [parking.name, parking.address, parking.zone].some((field) =>
    normalize(field).includes(needle),
  );
}

function matchesFilters(parking: Parking, filters: Filters): boolean {
  if (filters.maxPrice != null && parking.pricePerHour > filters.maxPrice) return false;
  if (
    filters.maxDistance != null &&
    parking.distanceMeters != null &&
    parking.distanceMeters > filters.maxDistance
  ) {
    return false;
  }
  if (filters.onlyAvailable && parking.spotsAvailable === 0) return false;
  if (filters.kinds.length > 0 && !filters.kinds.includes(parking.kind)) return false;
  if (filters.features.length > 0) {
    const has = new Set(parking.features);
    if (!filters.features.every((feature) => has.has(feature))) return false;
  }
  return true;
}

function sortParkings(list: Parking[], sort: Filters['sort']): Parking[] {
  const sorted = [...list];
  switch (sort) {
    case 'precio':
      sorted.sort((a, b) => a.pricePerHour - b.pricePerHour);
      break;
    case 'calificacion':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    case 'distancia':
    default:
      sorted.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
      break;
  }
  return sorted;
}

/** Parkings near a point, closest first. */
export function fetchNearbyParkings(near: LatLng): Promise<Parking[]> {
  return request(() => sortParkings(withDistance(clone(parkings), near), 'distancia'));
}

/** Full search: text + filters + sort. */
export function searchParkings(query: SearchQuery): Promise<Parking[]> {
  return request(() => {
    const withDist = withDistance(clone(parkings), query.near);
    const filtered = withDist
      .filter((parking) => matchesText(parking, query.text))
      .filter((parking) => matchesFilters(parking, query.filters));
    return sortParkings(filtered, query.filters.sort);
  });
}

/** Count only — used to label the "Ver N resultados" button while filtering. */
export function countParkings(query: SearchQuery): Promise<number> {
  return request(() => {
    const withDist = withDistance(clone(parkings), query.near);
    return withDist
      .filter((parking) => matchesText(parking, query.text))
      .filter((parking) => matchesFilters(parking, query.filters)).length;
  }, 120);
}

export function fetchParking(id: string, near?: LatLng): Promise<Parking> {
  return request(() => {
    const found = parkingsById.get(id);
    if (!found) throw new ServiceError('No encontramos este parqueadero.');
    const copy = clone(found);
    if (near) copy.distanceMeters = distanceMeters(near, copy.coordinate);
    return copy;
  });
}

export function fetchParkings(ids: string[], near?: LatLng): Promise<Parking[]> {
  return request(() =>
    ids
      .map((id) => parkingsById.get(id))
      .filter((parking): parking is Parking => parking != null)
      .map((parking) => {
        const copy = clone(parking);
        if (near) copy.distanceMeters = distanceMeters(near, copy.coordinate);
        return copy;
      }),
  );
}

/** Zones and recent searches for the search screen. */
export function fetchSuggestions(text: string): Promise<Suggestion[]> {
  return request(() => {
    if (text.trim().length === 0) {
      return [...recentSearches, ...zoneSuggestions];
    }
    const needle = normalize(text);
    const zones = zoneSuggestions.filter((zone) => normalize(zone.label).includes(needle));
    const places: Suggestion[] = parkings
      .filter((parking) => matchesText(parking, text))
      .slice(0, 5)
      .map((parking) => ({
        id: `pl-${parking.id}`,
        label: parking.name,
        detail: `${parking.address} · ${parking.zone}`,
        coordinate: parking.coordinate,
        kind: 'lugar',
      }));
    return [...zones, ...places];
  }, 160);
}
