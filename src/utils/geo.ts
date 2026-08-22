import type { LatLng } from '@/types';

/** Default map centre: Chapinero, Bogotá. Stands in for the user's location. */
export const BOGOTA_CENTER: LatLng = { latitude: 4.6602, longitude: -74.0555 };

const EARTH_RADIUS_M = 6_371_000;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in metres. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h)));
}

export type Region = {
  center: LatLng;
  /** Degrees of latitude covered by the viewport. */
  latitudeDelta: number;
  longitudeDelta: number;
};

export const DEFAULT_REGION: Region = {
  center: BOGOTA_CENTER,
  latitudeDelta: 0.055,
  longitudeDelta: 0.045,
};

/**
 * Projects a coordinate into viewport pixels. Equirectangular projection —
 * accurate enough at city scale and cheap enough to run on every frame.
 */
export function project(
  coordinate: LatLng,
  region: Region,
  size: { width: number; height: number },
): { x: number; y: number } {
  const west = region.center.longitude - region.longitudeDelta / 2;
  const north = region.center.latitude + region.latitudeDelta / 2;
  return {
    x: ((coordinate.longitude - west) / region.longitudeDelta) * size.width,
    y: ((north - coordinate.latitude) / region.latitudeDelta) * size.height,
  };
}

/** Inverse of {@link project}. */
export function unproject(
  point: { x: number; y: number },
  region: Region,
  size: { width: number; height: number },
): LatLng {
  const west = region.center.longitude - region.longitudeDelta / 2;
  const north = region.center.latitude + region.latitudeDelta / 2;
  return {
    longitude: west + (point.x / size.width) * region.longitudeDelta,
    latitude: north - (point.y / size.height) * region.latitudeDelta,
  };
}

/** Region that frames a set of coordinates with a little breathing room. */
export function regionForCoordinates(coordinates: LatLng[], padding = 1.4): Region {
  if (coordinates.length === 0) return DEFAULT_REGION;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const c of coordinates) {
    minLat = Math.min(minLat, c.latitude);
    maxLat = Math.max(maxLat, c.latitude);
    minLng = Math.min(minLng, c.longitude);
    maxLng = Math.max(maxLng, c.longitude);
  }

  return {
    center: {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
    },
    latitudeDelta: Math.max((maxLat - minLat) * padding, 0.01),
    longitudeDelta: Math.max((maxLng - minLng) * padding, 0.01),
  };
}
