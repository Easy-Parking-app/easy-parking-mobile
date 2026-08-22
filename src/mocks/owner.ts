import type { Booking, OwnerListing, OwnerSummary } from '@/types';
import { quote } from '@/utils/pricing';
import { bookings } from './bookings';
import { parkings } from './parkings';

const [, , , p4, , , , , p9, , , p12] = parkings;

/** Listings published by the signed-in user in owner mode. */
export const ownerListings: OwnerListing[] = [
  {
    id: 'lst-1',
    parking: p4!,
    status: 'publicado',
    monthEarnings: 1_284_000,
    monthBookings: 31,
    occupancyRate: 0.78,
  },
  {
    id: 'lst-2',
    parking: p9!,
    status: 'publicado',
    monthEarnings: 642_500,
    monthBookings: 19,
    occupancyRate: 0.54,
  },
  {
    id: 'lst-3',
    parking: p12!,
    status: 'pausado',
    monthEarnings: 0,
    monthBookings: 0,
    occupancyRate: 0,
  },
];

export const ownerSummary: OwnerSummary = {
  monthEarnings: 1_926_500,
  pendingPayout: 412_000,
  bookingsThisMonth: 50,
  averageRating: 4.8,
  history: [
    { month: '2026-03', amount: 1_105_000 },
    { month: '2026-04', amount: 1_318_000 },
    { month: '2026-05', amount: 1_244_500 },
    { month: '2026-06', amount: 1_580_000 },
    { month: '2026-07', amount: 1_742_000 },
    { month: '2026-08', amount: 1_926_500 },
  ],
};

/** Shifts a template booking onto another listing, day and time. */
function reassign(
  template: Booking,
  options: {
    id: string;
    code: string;
    listing: typeof p4;
    days: number;
    startHour: number;
    endHour: number;
    status: Booking['status'];
  },
): Booking {
  const { listing } = options;
  const at = (hour: number) => {
    const date = new Date();
    date.setDate(date.getDate() + options.days);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };

  return {
    ...template,
    id: options.id,
    code: options.code,
    status: options.status,
    parkingId: listing!.id,
    parking: {
      id: listing!.id,
      name: listing!.name,
      address: listing!.address,
      zone: listing!.zone,
      photos: listing!.photos,
      coordinate: listing!.coordinate,
    },
    startsAt: at(options.startHour),
    endsAt: at(options.endHour),
    price: quote(listing!, options.startHour * 60, options.endHour * 60),
  };
}

const template = bookings[0]!;

/** Reservations other drivers made on the owner's listings. */
export const ownerBookings: Booking[] = [
  reassign(template, {
    id: 'own-1',
    code: 'EP-6014',
    listing: p4,
    days: 0,
    startHour: 18,
    endHour: 23,
    status: 'activa',
  }),
  reassign(template, {
    id: 'own-2',
    code: 'EP-6088',
    listing: p9,
    days: 1,
    startHour: 8,
    endHour: 17,
    status: 'proxima',
  }),
  reassign(template, {
    id: 'own-3',
    code: 'EP-6131',
    listing: p4,
    days: 3,
    startHour: 12,
    endHour: 15,
    status: 'proxima',
  }),
  reassign(template, {
    id: 'own-4',
    code: 'EP-5902',
    listing: p4,
    days: -2,
    startHour: 19,
    endHour: 23,
    status: 'completada',
  }),
  reassign(template, {
    id: 'own-5',
    code: 'EP-5844',
    listing: p9,
    days: -5,
    startHour: 9,
    endHour: 13,
    status: 'completada',
  }),
  reassign(template, {
    id: 'own-6',
    code: 'EP-5790',
    listing: p4,
    days: -8,
    startHour: 20,
    endHour: 22,
    status: 'cancelada',
  }),
];

/** Names shown next to owner-side reservations. */
export const ownerBookingGuests: Record<string, string> = {
  'own-1': 'Sofía Lozano',
  'own-2': 'Camilo Betancur',
  'own-3': 'Andrea Lugo',
  'own-4': 'Ricardo Mesa',
  'own-5': 'Tatiana Cruz',
  'own-6': 'Julián Estrada',
};
