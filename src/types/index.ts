/**
 * Domain model for Easy Parking.
 *
 * These shapes are the contract between the UI and the service layer. When the
 * Supabase backend lands, the services change; these types should barely move.
 */

export type Id = string;

/** WGS84 coordinate. */
export type LatLng = {
  latitude: number;
  longitude: number;
};

export type ParkingKind = 'garaje' | 'edificio' | 'lote' | 'centro-comercial';

export type FeatureKey =
  | 'cubierto'
  | 'vigilancia'
  | 'carga-electrica'
  | 'moto'
  | 'camioneta'
  | 'accesibilidad'
  | 'lavado'
  | 'acceso-24h';

export type AvailabilityLevel = 'disponible' | 'pocos' | 'lleno';

export type OpeningHours = {
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  /** Minutes from midnight. */
  opensAt: number;
  closesAt: number;
};

export type Review = {
  id: Id;
  author: string;
  avatarUrl?: string;
  rating: number;
  date: string;
  comment: string;
};

export type Owner = {
  id: Id;
  name: string;
  avatarUrl?: string;
  verified: boolean;
  memberSince: string;
  responseRate: number;
};

export type Parking = {
  id: Id;
  name: string;
  /** Street address as a driver would read it aloud. */
  address: string;
  /** Neighbourhood, e.g. "Chapinero". */
  zone: string;
  kind: ParkingKind;
  coordinate: LatLng;
  photos: string[];
  /** COP per hour. */
  pricePerHour: number;
  /** COP per day, when the owner offers a day rate. */
  pricePerDay?: number;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  features: FeatureKey[];
  hours: OpeningHours[];
  rules: string[];
  description: string;
  owner: Owner;
  /** Spaces free right now. */
  spotsAvailable: number;
  spotsTotal: number;
  /** Verified by Easy Parking. */
  verified: boolean;
  /** Metres from the user. Filled in by the service layer. */
  distanceMeters?: number;
};

export type PriceBreakdown = {
  hours: number;
  /** COP. */
  subtotal: number;
  serviceFee: number;
  total: number;
};

export type BookingStatus = 'proxima' | 'activa' | 'completada' | 'cancelada';

export type PaymentMethodKind = 'nequi' | 'daviplata' | 'pse' | 'tarjeta';

export type PaymentMethod = {
  id: Id;
  kind: PaymentMethodKind;
  label: string;
  /** e.g. "•••• 4821" or a masked phone. */
  detail: string;
};

export type Booking = {
  id: Id;
  /** Human-facing code, e.g. "EP-4821". */
  code: string;
  parkingId: Id;
  parking: Pick<Parking, 'id' | 'name' | 'address' | 'zone' | 'photos' | 'coordinate'>;
  /** ISO 8601. */
  startsAt: string;
  endsAt: string;
  status: BookingStatus;
  price: PriceBreakdown;
  paymentMethod: PaymentMethod;
  createdAt: string;
};

export type BookingDraft = {
  parkingId: Id;
  /** ISO date, no time — the day being booked. */
  date: string;
  /** Minutes from midnight. */
  startMinutes: number;
  endMinutes: number;
  paymentMethodId?: Id;
};

export type User = {
  id: Id;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  isOwner: boolean;
  memberSince: string;
};

/* ---------------------------------------------------------------- searching */

export type SortKey = 'distancia' | 'precio' | 'calificacion';

export type Filters = {
  /** COP per hour. `null` means "no bound". */
  maxPrice: number | null;
  /** Metres. */
  maxDistance: number | null;
  onlyAvailable: boolean;
  features: FeatureKey[];
  kinds: ParkingKind[];
  sort: SortKey;
};

export type SearchQuery = {
  text: string;
  near: LatLng;
  filters: Filters;
};

export type Suggestion = {
  id: Id;
  label: string;
  detail: string;
  coordinate: LatLng;
  kind: 'zona' | 'lugar' | 'reciente';
};

/* ------------------------------------------------------------------- owner */

export type OwnerListingStatus = 'publicado' | 'borrador' | 'pausado';

export type OwnerListing = {
  id: Id;
  parking: Parking;
  status: OwnerListingStatus;
  /** COP earned this month. */
  monthEarnings: number;
  monthBookings: number;
  occupancyRate: number;
};

export type EarningsPoint = {
  /** ISO month, e.g. "2026-08". */
  month: string;
  amount: number;
};

export type OwnerSummary = {
  monthEarnings: number;
  pendingPayout: number;
  bookingsThisMonth: number;
  averageRating: number;
  history: EarningsPoint[];
};

/** Draft used by the publish wizard. */
export type ListingDraft = {
  photos: string[];
  coordinate: LatLng | null;
  address: string;
  zone: string;
  /**
   * Referencias cercanas: "frente al Centro Comercial Andino".
   *
   * Opcional. En Colombia la gente ubica por referencia antes que por
   * nomenclatura, y para el conductor es la señal más rápida de si el
   * parqueadero le sirve. Vacío es un estado válido.
   */
  landmarks: string[];
  name: string;
  kind: ParkingKind | null;
  description: string;
  features: FeatureKey[];
  pricePerHour: number | null;
  pricePerDay: number | null;
  hours: OpeningHours[];
  spotsTotal: number | null;
  rules: string[];
};

/* -------------------------------------------------------------- async state */

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};
