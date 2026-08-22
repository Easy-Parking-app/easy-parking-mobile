import type { Booking, Parking } from '@/types';
import { quote } from '@/utils/pricing';
import { parkings } from './parkings';
import { paymentMethods } from './user';

const summarize = (parking: Parking): Booking['parking'] => ({
  id: parking.id,
  name: parking.name,
  address: parking.address,
  zone: parking.zone,
  photos: parking.photos,
  coordinate: parking.coordinate,
});

/** Builds an ISO timestamp `days` from today at `hour`:`minute`. */
const at = (days: number, hour: number, minute = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const build = (
  id: string,
  code: string,
  parking: Parking,
  days: number,
  startHour: number,
  endHour: number,
  status: Booking['status'],
  paymentIndex = 0,
): Booking => ({
  id,
  code,
  parkingId: parking.id,
  parking: summarize(parking),
  startsAt: at(days, startHour),
  endsAt: at(days, endHour),
  status,
  price: quote(parking, startHour * 60, endHour * 60),
  paymentMethod: paymentMethods[paymentIndex] ?? paymentMethods[0]!,
  createdAt: at(days - 2, 9),
});

const [p1, p2, p3, p4, p5, p6, p7] = parkings;

/** Reservations for the signed-in driver, across the three states. */
export const bookings: Booking[] = [
  build('bk-01', 'EP-4821', p1!, 0, 14, 18, 'activa', 0),
  build('bk-02', 'EP-5107', p4!, 2, 19, 23, 'proxima', 1),
  build('bk-03', 'EP-5233', p3!, 6, 8, 13, 'proxima', 0),
  build('bk-04', 'EP-4409', p2!, -3, 7, 12, 'completada', 1),
  build('bk-05', 'EP-4288', p5!, -9, 11, 15, 'completada', 3),
  build('bk-06', 'EP-4130', p7!, -16, 6, 18, 'completada', 0),
  build('bk-07', 'EP-3998', p6!, -24, 9, 11, 'cancelada', 2),
];

export const bookingsById = new Map(bookings.map((b) => [b.id, b]));
