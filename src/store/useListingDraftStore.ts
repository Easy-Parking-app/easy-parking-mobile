import { create } from 'zustand';

import type { FeatureKey, LatLng, ListingDraft, OpeningHours, ParkingKind } from '@/types';

/** Nine steps, one decision each. Order matters — it drives the wizard. */
export const publishSteps = [
  'fotos',
  'ubicacion',
  'informacion',
  'caracteristicas',
  'precio',
  'horarios',
  'disponibilidad',
  'revision',
] as const;

export type PublishStep = (typeof publishSteps)[number];

export const stepTitles: Record<PublishStep, { title: string; hint: string }> = {
  fotos: { title: 'Muestra tu espacio', hint: 'Tres fotos claras bastan para generar confianza.' },
  ubicacion: { title: '¿Dónde queda?', hint: 'Ajusta el punto hasta que quede sobre la entrada.' },
  informacion: { title: 'Cuéntanos del lugar', hint: 'Un nombre reconocible y una descripción breve.' },
  caracteristicas: { title: '¿Qué ofrece?', hint: 'Selecciona todo lo que aplique.' },
  precio: { title: 'Define tu tarifa', hint: 'Puedes cambiarla cuando quieras.' },
  horarios: { title: '¿Cuándo está disponible?', hint: 'Define la franja en la que recibes vehículos.' },
  disponibilidad: { title: '¿Cuántos cupos?', hint: 'Indica cuántos vehículos caben a la vez.' },
  revision: { title: 'Revisa y publica', hint: 'Así lo verán los conductores.' },
};

const emptyDraft: ListingDraft = {
  photos: [],
  coordinate: null,
  address: '',
  zone: '',
  name: '',
  kind: null,
  description: '',
  features: [],
  pricePerHour: null,
  pricePerDay: null,
  hours: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
    weekday,
    opensAt: 6 * 60,
    closesAt: 22 * 60,
  })),
  spotsTotal: null,
  rules: [],
};

type ListingDraftState = {
  draft: ListingDraft;
  step: number;
  setStep: (step: number) => void;
  next: () => void;
  back: () => void;
  addPhoto: (uri: string) => void;
  removePhoto: (uri: string) => void;
  setCoordinate: (coordinate: LatLng, address: string, zone: string) => void;
  setInfo: (info: { name?: string; description?: string; kind?: ParkingKind }) => void;
  toggleFeature: (feature: FeatureKey) => void;
  setPrice: (pricePerHour: number | null, pricePerDay?: number | null) => void;
  setHours: (hours: OpeningHours[]) => void;
  setSpots: (spotsTotal: number | null) => void;
  reset: () => void;
  /** True when the current step has enough information to continue. */
  canContinue: () => boolean;
};

export const useListingDraftStore = create<ListingDraftState>((set, get) => ({
  draft: emptyDraft,
  step: 0,

  setStep: (step) => set({ step: Math.max(0, Math.min(publishSteps.length - 1, step)) }),
  next: () => set((state) => ({ step: Math.min(publishSteps.length - 1, state.step + 1) })),
  back: () => set((state) => ({ step: Math.max(0, state.step - 1) })),

  addPhoto: (uri) =>
    set((state) => ({
      draft: { ...state.draft, photos: [...state.draft.photos, uri].slice(0, 6) },
    })),
  removePhoto: (uri) =>
    set((state) => ({
      draft: { ...state.draft, photos: state.draft.photos.filter((item) => item !== uri) },
    })),
  setCoordinate: (coordinate, address, zone) =>
    set((state) => ({ draft: { ...state.draft, coordinate, address, zone } })),
  setInfo: (info) => set((state) => ({ draft: { ...state.draft, ...info } })),
  toggleFeature: (feature) =>
    set((state) => ({
      draft: {
        ...state.draft,
        features: state.draft.features.includes(feature)
          ? state.draft.features.filter((item) => item !== feature)
          : [...state.draft.features, feature],
      },
    })),
  setPrice: (pricePerHour, pricePerDay) =>
    set((state) => ({
      draft: {
        ...state.draft,
        pricePerHour,
        pricePerDay: pricePerDay === undefined ? state.draft.pricePerDay : pricePerDay,
      },
    })),
  setHours: (hours) => set((state) => ({ draft: { ...state.draft, hours } })),
  setSpots: (spotsTotal) => set((state) => ({ draft: { ...state.draft, spotsTotal } })),
  reset: () => set({ draft: emptyDraft, step: 0 }),

  canContinue: () => {
    const { draft, step } = get();
    switch (publishSteps[step]) {
      case 'fotos':
        return draft.photos.length >= 1;
      case 'ubicacion':
        return draft.coordinate != null && draft.address.trim().length > 3;
      case 'informacion':
        return draft.name.trim().length > 2 && draft.kind != null;
      case 'caracteristicas':
        return true;
      case 'precio':
        return draft.pricePerHour != null && draft.pricePerHour > 0;
      case 'horarios':
        return draft.hours.length > 0;
      case 'disponibilidad':
        return draft.spotsTotal != null && draft.spotsTotal > 0;
      case 'revision':
      default:
        return true;
    }
  },
}));
