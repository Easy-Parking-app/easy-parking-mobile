import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deviceLocale, setLocale, type Locale } from '@/i18n';
import { storage, storeKey } from './persist';

/** App de navegación a la que se envía al conductor desde una reserva. */
export type NavigationApp = 'google' | 'waze' | 'apple';

/** Idioma de la interfaz. `auto` sigue al del teléfono. */
export type LanguagePreference = 'auto' | Locale;

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
  language: LanguagePreference;

  setHaptics: (value: boolean) => void;
  setNotifyBookings: (value: boolean) => void;
  setNotifyReminders: (value: boolean) => void;
  setNotifyNews: (value: boolean) => void;
  setReminderLead: (value: ReminderLead) => void;
  setNavigationApp: (value: NavigationApp) => void;
  setUseLocation: (value: boolean) => void;
  setLanguage: (value: LanguagePreference) => void;
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
  language: 'auto' as LanguagePreference,
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
      setLanguage: (language) => {
        setLocale(language === 'auto' ? deviceLocale() : language);
        set({ language });
      },
      reset: () => set(defaults),
    }),
    {
      name: storeKey('settings'),
      storage,
      /**
       * El idioma guardado se aplica al recuperar la sesión.
       *
       * `i18n` arranca con el del teléfono, que es lo correcto la primera vez;
       * si el usuario eligió otro, la preferencia llega aquí unos milisegundos
       * después y hay que volver a aplicarla.
       */
      onRehydrateStorage: () => (state) => {
        if (state && state.language !== 'auto') setLocale(state.language);
      },
    },
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
