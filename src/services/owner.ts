import {
  ownerBookingGuests,
  ownerBookings,
  ownerListings as seedListings,
  ownerSummary,
} from '@/mocks/owner';
import type { Booking, ListingDraft, OwnerListing, OwnerSummary } from '@/types';
import { clone, request, ServiceError } from './client';

let listings: OwnerListing[] = clone(seedListings);

export function fetchOwnerSummary(): Promise<OwnerSummary> {
  return request(() => clone(ownerSummary));
}

export function fetchOwnerListings(): Promise<OwnerListing[]> {
  return request(() => clone(listings));
}

export function fetchOwnerBookings(): Promise<Booking[]> {
  return request(() => clone(ownerBookings));
}

export function guestNameFor(bookingId: string): string {
  return ownerBookingGuests[bookingId] ?? 'Conductor Easy Parking';
}

export function setListingStatus(
  id: string,
  status: OwnerListing['status'],
): Promise<OwnerListing> {
  return request(() => {
    const index = listings.findIndex((listing) => listing.id === id);
    if (index < 0) throw new ServiceError('No encontramos este parqueadero.');
    const updated: OwnerListing = { ...listings[index]!, status };
    listings = listings.map((listing, i) => (i === index ? updated : listing));
    return clone(updated);
  });
}

/** Publishes the wizard draft. Returns the id of the new listing. */
export function publishListing(draft: ListingDraft): Promise<{ id: string }> {
  return request(() => {
    if (draft.photos.length === 0) throw new ServiceError('Agrega al menos una foto.');
    if (!draft.coordinate) throw new ServiceError('Indica la ubicación del parqueadero.');
    if (draft.pricePerHour == null) throw new ServiceError('Define un precio por hora.');
    return { id: `lst-${Date.now()}` };
  }, 1100);
}
