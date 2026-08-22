import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { storage, storeKey } from './persist';

/** App de navegación a la que se envía al conductor desde una reserva. */
export type NavigationApp = 'google' | 'waze' | 'apple';

/** Antelación del recordatorio, en minutos. */
export type ReminderLead = 15 | 30 | 60;

type SettingsState = {
  /** Feedback háptico en toques y selecciones. */
  haptics: boolean;
  /** Avisos de estado de la reserva (confirmada, cancelada). */
  notifyBookings: boolean;
  /** Recordatorio antes de la hora de entrada. */
  notifyReminders: boolean;
  /** Novedades y promociones. */
  notifyNews: boolean;
  reminderLead: ReminderLead;
  navigationApp: NavigationApp;
  /** Permite que la app use la ubicación para ordenar por cercanía. */
  useLocation: boolean;

  setHaptics: (value: boolean) => void;
  setNotifyBookings: (value: boolean) => void;
  setNotifyReminders: (value: boolean) => void;
  setNotifyNews: (value: boolean) => void;
  setReminderLead: (value: ReminderLead) => void;
  setNavigationApp: (value: NavigationApp) => void;
  setUseLocation: (value: boolean) => void;
  reset: () => void;
};

const defaults = {
  haptics: true,
  notifyBookings: true,
  notifyReminders: true,
  notifyNews: false,
  reminderLead: 30 as ReminderLead,
  navigationApp: 'google' as NavigationApp,
  useLocation: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaults,
      setHaptics: (haptics) => set({ haptics }),
      setNotifyBookings: (notifyBookings) => set({ notifyBookings }),
      setNotifyReminders: (notifyReminders) => set({ notifyReminders }),
      setNotifyNews: (notifyNews) => set({ notifyNews }),
      setReminderLead: (reminderLead) => set({ reminderLead }),
      setNavigationApp: (navigationApp) => set({ navigationApp }),
      setUseLocation: (useLocation) => set({ useLocation }),
      reset: () => set(defaults),
    }),
    { name: storeKey('settings'), storage },
  ),
);

/**
 * Lectura fuera de React.
 *
 * `PressableScale` consulta la preferencia de háptica en el manejador de
 * `onPressIn`, no en el render: suscribir cada superficie pulsable de la app a
 * la store solo para leer un booleano provocaría re-renders inútiles.
 */
export const hapticsEnabled = () => useSettingsStore.getState().haptics;

export const navigationAppLabels: Record<NavigationApp, string> = {
  google: 'Google Maps',
  waze: 'Waze',
  apple: 'Apple Maps',
};
