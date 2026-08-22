import type { Parking, PriceBreakdown } from '@/types';

/** Easy Parking's cut, applied to the subtotal. */
export const SERVICE_FEE_RATE = 0.1;
const MIN_SERVICE_FEE = 900;

const roundTo100 = (value: number) => Math.round(value / 100) * 100;

/**
 * Quotes a stay. Hours are billed in 30-minute steps with a one-hour minimum,
 * and the daily rate caps the subtotal when the owner offers one.
 */
export function quote(
  parking: Pick<Parking, 'pricePerHour' | 'pricePerDay'>,
  startMinutes: number,
  endMinutes: number,
): PriceBreakdown {
  const rawMinutes = Math.max(0, endMinutes - startMinutes);
  const billedMinutes = Math.max(60, Math.ceil(rawMinutes / 30) * 30);
  const hours = billedMinutes / 60;

  const byHour = parking.pricePerHour * hours;
  const subtotal = roundTo100(
    parking.pricePerDay != null ? Math.min(byHour, parking.pricePerDay) : byHour,
  );

  const serviceFee = Math.max(MIN_SERVICE_FEE, roundTo100(subtotal * SERVICE_FEE_RATE));

  return {
    hours: rawMinutes / 60,
    subtotal,
    serviceFee,
    total: subtotal + serviceFee,
  };
}

/** True when the day rate is cheaper than billing by the hour. */
export function isDayRateApplied(
  parking: Pick<Parking, 'pricePerHour' | 'pricePerDay'>,
  startMinutes: number,
  endMinutes: number,
): boolean {
  if (parking.pricePerDay == null) return false;
  const billedMinutes = Math.max(60, Math.ceil(Math.max(0, endMinutes - startMinutes) / 30) * 30);
  return parking.pricePerHour * (billedMinutes / 60) > parking.pricePerDay;
}
