import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { storage, storeKey } from './persist';

type FavoritesState = {
  ids: string[];
  toggle: (id: string) => void;
  isFavorite: (id: string) => boolean;
  remove: (id: string) => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: ['pk-04', 'pk-03'],
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((item) => item !== id)
            : [id, ...state.ids],
        })),
      isFavorite: (id) => get().ids.includes(id),
      remove: (id) => set((state) => ({ ids: state.ids.filter((item) => item !== id) })),
    }),
    { name: storeKey('favorites'), storage },
  ),
);

/** Selector hook so a row only re-renders when its own flag flips. */
export function useIsFavorite(id: string): boolean {
  return useFavoritesStore((state) => state.ids.includes(id));
}
