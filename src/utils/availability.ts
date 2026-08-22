import { palette } from '@/constants/theme';
import { availabilityCopy } from '@/constants/catalog';
import type { AvailabilityLevel, Parking } from '@/types';

/** Fewer than this many free spaces reads as "pocos cupos". */
const SCARCE_THRESHOLD = 0.25;

export function availabilityLevel(
  parking: Pick<Parking, 'spotsAvailable' | 'spotsTotal'>,
): AvailabilityLevel {
  if (parking.spotsAvailable <= 0) return 'lleno';
  if (parking.spotsTotal > 0 && parking.spotsAvailable / parking.spotsTotal <= SCARCE_THRESHOLD) {
    return 'pocos';
  }
  return 'disponible';
}

export function availabilityTone(level: AvailabilityLevel): {
  label: string;
  fg: string;
  bg: string;
} {
  switch (level) {
    case 'disponible':
      return { label: availabilityCopy.disponible, fg: palette.available, bg: palette.availableSoft };
    case 'pocos':
      return { label: availabilityCopy.pocos, fg: palette.scarce, bg: palette.scarceSoft };
    case 'lleno':
    default:
      return { label: availabilityCopy.lleno, fg: palette.inkTertiary, bg: palette.surfaceAlt };
  }
}

/** "8 cupos disponibles" / "Último cupo" / "Sin cupos". */
export function availabilityDetail(
  parking: Pick<Parking, 'spotsAvailable' | 'spotsTotal'>,
): string {
  if (parking.spotsAvailable <= 0) return 'Sin cupos disponibles';
  if (parking.spotsAvailable === 1) return 'Último cupo disponible';
  return `${parking.spotsAvailable} cupos disponibles`;
}
