/**
 * Formatting helpers. Colombian conventions: `$ 4.500`, 24h clock rendered as
 * `8:30 a. m.`, distances in metres below 1 km.
 */

const copFormatter = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 0,
});

/** `4500` → `"$ 4.500"`. */
export function formatCop(amount: number): string {
  return `$ ${copFormatter.format(Math.round(amount))}`;
}

/** `4500` → `"$ 4.500/hora"`. */
export function formatHourlyRate(amount: number): string {
  return `${formatCop(amount)}/hora`;
}

/** `320` → `"320 m"`, `1450` → `"1,4 km"`. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

/** Rough walking time at 80 m/min. */
export function formatWalkingTime(meters: number): string {
  const minutes = Math.max(1, Math.round(meters / 80));
  return `${minutes} min caminando`;
}

/** Minutes from midnight → `"8:30 a. m."`. */
export function formatMinutes(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const suffix = hours24 < 12 ? 'a. m.' : 'p. m.';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

/** `"8:30 a. m. – 12:30 p. m."` */
export function formatTimeRange(startMinutes: number, endMinutes: number): string {
  return `${formatMinutes(startMinutes)} – ${formatMinutes(endMinutes)}`;
}

/** `240` → `"4 horas"`, `90` → `"1 h 30 min"`. */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return hours === 1 ? '1 hora' : `${hours} horas`;
  if (hours === 0) return `${minutes} min`;
  return `${hours} h ${minutes} min`;
}

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

const WEEKDAYS_LONG = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;

const WEEKDAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

/** `"martes 25 de agosto"` */
export function formatLongDate(date: Date): string {
  const weekday = WEEKDAYS_LONG[date.getDay()] ?? '';
  const month = MONTHS[date.getMonth()] ?? '';
  return `${weekday} ${date.getDate()} de ${month}`;
}

/** `"25 ago"` */
export function formatShortDate(date: Date): string {
  const month = (MONTHS[date.getMonth()] ?? '').slice(0, 3);
  return `${date.getDate()} ${month}`;
}

/** `"Mar"` */
export function formatWeekdayShort(date: Date): string {
  return WEEKDAYS_SHORT[date.getDay()] ?? '';
}

/** `"Hoy"`, `"Mañana"` or `"martes 25 de agosto"`. */
export function formatRelativeDay(date: Date, now = new Date()): string {
  const a = startOfDay(date).getTime();
  const b = startOfDay(now).getTime();
  const days = Math.round((a - b) / 86_400_000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days === -1) return 'Ayer';
  return formatLongDate(date);
}

/** "Hoy", "Mañana" or "24 ago" — for dense rows where the long date would truncate. */
export function formatRelativeShort(date: Date, now = new Date()): string {
  const days = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / 86400000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days === -1) return 'Ayer';
  return formatShortDate(date);
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** `"2026-08"` → `"ago 2026"` */
export function formatMonth(isoMonth: string): string {
  const [year, month] = isoMonth.split('-');
  const index = Number(month) - 1;
  return `${(MONTHS[index] ?? '').slice(0, 3)} ${year}`;
}

/** ISO date string (`2026-08-25`) for a Date, in local time. */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Combines an ISO date and minutes-from-midnight into a Date. */
export function fromIsoDateAndMinutes(isoDate: string, minutes: number): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  date.setMinutes(minutes);
  return date;
}

/** Minutes from midnight for a Date. */
export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** `4.8` → `"4,8"` — Colombian decimal separator. */
export function formatRating(rating: number): string {
  return rating.toFixed(1).replace('.', ',');
}

/** Initials for the avatar fallback: `"Camila Restrepo"` → `"CR"`. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
