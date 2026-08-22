import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { FeatureKey, Filters, LatLng, ParkingKind, SortKey, Suggestion } from '@/types';
import { storage, storeKey } from './persist';

export const defaultFilters: Filters = {
  maxPrice: null,
  maxDistance: null,
  onlyAvailable: false,
  features: [],
  kinds: [],
  sort: 'distancia',
};

/** Number of active filter groups — drives the badge on the filter button. */
export function countActiveFilters(filters: Filters): number {
  let count = 0;
  if (filters.maxPrice != null) count += 1;
  if (filters.maxDistance != null) count += 1;
  if (filters.onlyAvailable) count += 1;
  if (filters.features.length > 0) count += 1;
  if (filters.kinds.length > 0) count += 1;
  if (filters.sort !== defaultFilters.sort) count += 1;
  return count;
}

const toggle = <T>(list: T[], value: T): T[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

type SearchState = {
  text: string;
  /** Centre of the search. Defaults to the driver's location. */
  near: LatLng | null;
  /** Label shown in the search pill when the driver picked a zone. */
  nearLabel: string | null;
  filters: Filters;
  recents: Suggestion[];
  /** Marker currently focused on the map. */
  selectedId: string | null;

  setText: (text: string) => void;
  applySuggestion: (suggestion: Suggestion) => void;
  clearLocation: () => void;
  select: (id: string | null) => void;

  setSort: (sort: SortKey) => void;
  setMaxPrice: (value: number | null) => void;
  setMaxDistance: (value: number | null) => void;
  setOnlyAvailable: (value: boolean) => void;
  toggleFeature: (feature: FeatureKey) => void;
  toggleKind: (kind: ParkingKind) => void;
  resetFilters: () => void;
  setFilters: (filters: Filters) => void;
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      text: '',
      near: null,
      nearLabel: null,
      filters: defaultFilters,
      recents: [],
      selectedId: null,

      setText: (text) => set({ text }),
      applySuggestion: (suggestion) =>
        set((state) => ({
          text: '',
          near: suggestion.coordinate,
          nearLabel: suggestion.label,
          selectedId: null,
          recents: [
            { ...suggestion, kind: 'reciente' as const, detail: 'Búsqueda reciente' },
            ...state.recents.filter((item) => item.label !== suggestion.label),
          ].slice(0, 4),
        })),
      clearLocation: () => set({ near: null, nearLabel: null, text: '' }),
      select: (selectedId) => set({ selectedId }),

      setSort: (sort) => set((state) => ({ filters: { ...state.filters, sort } })),
      setMaxPrice: (maxPrice) => set((state) => ({ filters: { ...state.filters, maxPrice } })),
      setMaxDistance: (maxDistance) =>
        set((state) => ({ filters: { ...state.filters, maxDistance } })),
      setOnlyAvailable: (onlyAvailable) =>
        set((state) => ({ filters: { ...state.filters, onlyAvailable } })),
      toggleFeature: (feature) =>
        set((state) => ({
          filters: { ...state.filters, features: toggle(state.filters.features, feature) },
        })),
      toggleKind: (kind) =>
        set((state) => ({
          filters: { ...state.filters, kinds: toggle(state.filters.kinds, kind) },
        })),
      resetFilters: () => set({ filters: defaultFilters }),
      setFilters: (filters) => set({ filters }),
    }),
    {
      name: storeKey('search'),
      storage,
      partialize: (state) => ({ recents: state.recents }) as Partial<SearchState>,
    },
  ),
);
