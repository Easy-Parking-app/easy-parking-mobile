import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { currentUser } from '@/mocks/user';
import type { LatLng, User } from '@/types';
import { BOGOTA_CENTER } from '@/utils/geo';
import { storage, storeKey } from './persist';

export type AppMode = 'conductor' | 'propietario';

type SessionState = {
  user: User;
  mode: AppMode;
  /** Where the driver currently is. Mocked; a real GPS fix replaces it later. */
  location: LatLng;
  locating: boolean;
  setMode: (mode: AppMode) => void;
  setLocation: (location: LatLng) => void;
  /** Simulates a "locate me" tap. */
  locate: () => Promise<void>;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: currentUser,
      mode: 'conductor',
      location: BOGOTA_CENTER,
      locating: false,
      setMode: (mode) => set({ mode }),
      setLocation: (location) => set({ location }),
      locate: async () => {
        set({ locating: true });
        await new Promise((resolve) => setTimeout(resolve, 700));
        set({ location: BOGOTA_CENTER, locating: false });
      },
    }),
    {
      name: storeKey('session'),
      storage,
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
);
