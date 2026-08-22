/**
 * Human labels and iconography for the domain enums.
 *
 * Keeping this next to the theme means the icon set stays coherent: one family
 * (Lucide), one stroke width, one naming convention.
 */

import {
  Accessibility,
  Bike,
  Building2,
  Clock,
  CreditCard,
  Droplets,
  House,
  LandPlot,
  Landmark,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
  Warehouse,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import type { FeatureKey, ParkingKind, PaymentMethodKind } from '@/types';

export const featureCatalog: Record<
  FeatureKey,
  { label: string; short: string; icon: LucideIcon }
> = {
  cubierto: { label: 'Cubierto', short: 'Cubierto', icon: Warehouse },
  vigilancia: { label: 'Vigilancia 24/7', short: 'Vigilado', icon: ShieldCheck },
  'carga-electrica': { label: 'Carga eléctrica', short: 'Carga', icon: Zap },
  moto: { label: 'Apto para moto', short: 'Moto', icon: Bike },
  camioneta: { label: 'Acceso amplio', short: 'Camioneta', icon: Truck },
  accesibilidad: { label: 'Acceso accesible', short: 'Acceso', icon: Accessibility },
  lavado: { label: 'Lavado en sitio', short: 'Lavado', icon: Droplets },
  'acceso-24h': { label: 'Abierto 24 horas', short: '24 horas', icon: Clock },
};

export const featureOrder: FeatureKey[] = [
  'cubierto',
  'vigilancia',
  'carga-electrica',
  'acceso-24h',
  'moto',
  'camioneta',
  'accesibilidad',
  'lavado',
];

export const kindCatalog: Record<ParkingKind, { label: string; icon: LucideIcon }> = {
  garaje: { label: 'Garaje privado', icon: House },
  edificio: { label: 'Edificio', icon: Building2 },
  lote: { label: 'Lote', icon: LandPlot },
  'centro-comercial': { label: 'Centro comercial', icon: Store },
};

export const kindOrder: ParkingKind[] = ['garaje', 'edificio', 'lote', 'centro-comercial'];

export const paymentCatalog: Record<
  PaymentMethodKind,
  { label: string; icon: LucideIcon }
> = {
  nequi: { label: 'Nequi', icon: Smartphone },
  daviplata: { label: 'Daviplata', icon: Smartphone },
  pse: { label: 'PSE', icon: Landmark },
  tarjeta: { label: 'Tarjeta', icon: CreditCard },
};

/** Copy for the availability pill. */
export const availabilityCopy = {
  disponible: 'Disponible ahora',
  pocos: 'Pocos cupos',
  lleno: 'Sin cupos',
} as const;
