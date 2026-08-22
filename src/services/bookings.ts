import { bookings as seed } from '@/mocks/bookings';
import { parkingsById } from '@/mocks/parkings';
import { paymentMethods } from '@/mocks/user';
import type { Booking, BookingDraft, PaymentMethod } from '@/types';
import { fromIsoDateAndMinutes } from '@/utils/format';
import { quote } from '@/utils/pricing';
import { clone, request, ServiceError } from './client';

/**
 * In-memory store. Stands in for the `bookings` table; the module keeps its own
 * copy so confirming a reservation is visible across screens during a session.
 */
let store: Booking[] = clone(seed);

let sequence = 5300;
const nextCode = () => `EP-${(sequence += 37) % 10000}`;

export function fetchBookings(): Promise<Booking[]> {
  return request(() =>
    clone(store).sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    ),
  );
}

export function fetchBooking(id: string): Promise<Booking> {
  return request(() => {
    const found = store.find((booking) => booking.id === id);
    if (!found) throw new ServiceError('No encontramos esta reserva.');
    return clone(found);
  });
}

export function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  return request(() => clone(paymentMethods), 180);
}

export function createBooking(draft: BookingDraft): Promise<Booking> {
  return request(() => {
    const parking = parkingsById.get(draft.parkingId);
    if (!parking) throw new ServiceError('No encontramos este parqueadero.');
    if (parking.spotsAvailable === 0) {
      throw new ServiceError('Este parqueadero se quedó sin cupos.');
    }

    const method =
      paymentMethods.find((pm) => pm.id === draft.paymentMethodId) ?? paymentMethods[0]!;

    const booking: Booking = {
      id: `bk-${Date.now()}`,
      code: nextCode(),
      parkingId: parking.id,
      parking: {
        id: parking.id,
        name: parking.name,
        address: parking.address,
        zone: parking.zone,
        photos: parking.photos,
        coordinate: parking.coordinate,
      },
      startsAt: fromIsoDateAndMinutes(draft.date, draft.startMinutes).toISOString(),
      endsAt: fromIsoDateAndMinutes(draft.date, draft.endMinutes).toISOString(),
      status: 'proxima',
      price: quote(parking, draft.startMinutes, draft.endMinutes),
      paymentMethod: method,
      createdAt: new Date().toISOString(),
    };

    store = [booking, ...store];
    return clone(booking);
  }, 900);
}

export function cancelBooking(id: string): Promise<Booking> {
  return request(() => {
    const index = store.findIndex((booking) => booking.id === id);
    if (index < 0) throw new ServiceError('No encontramos esta reserva.');
    const updated: Booking = { ...store[index]!, status: 'cancelada' };
    store = store.map((booking, i) => (i === index ? updated : booking));
    return clone(updated);
  });
}
