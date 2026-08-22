import { create } from 'zustand';

import type { Booking } from '@/types';
import { toIsoDate } from '@/utils/format';

/** Rounds "now" up to the next half hour, so the default entry time is usable. */
function defaultStart(): number {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return Math.min(22 * 60, Math.ceil(minutes / 30) * 30 + 30);
}

type BookingState = {
  parkingId: string | null;
  date: string;
  startMinutes: number;
  endMinutes: number;
  paymentMethodId: string | null;
  /** Set after a successful confirmation so the receipt screen can read it. */
  lastConfirmed: Booking | null;

  /** Resets the draft to sensible defaults for a given parking. */
  start: (parkingId: string) => void;
  setDate: (date: string) => void;
  setStart: (minutes: number) => void;
  setEnd: (minutes: number) => void;
  setPaymentMethod: (id: string) => void;
  confirm: (booking: Booking) => void;
  reset: () => void;
};

const MIN_STAY = 60;
const MAX_MINUTES = 24 * 60 - 30;

export const useBookingStore = create<BookingState>((set) => ({
  parkingId: null,
  date: toIsoDate(new Date()),
  startMinutes: defaultStart(),
  endMinutes: defaultStart() + 4 * 60,
  paymentMethodId: null,
  lastConfirmed: null,

  start: (parkingId) => {
    const startMinutes = defaultStart();
    set({
      parkingId,
      date: toIsoDate(new Date()),
      startMinutes,
      endMinutes: Math.min(MAX_MINUTES, startMinutes + 4 * 60),
      lastConfirmed: null,
    });
  },
  setDate: (date) => set({ date }),
  setStart: (minutes) =>
    set((state) => ({
      startMinutes: minutes,
      endMinutes: Math.min(MAX_MINUTES, Math.max(state.endMinutes, minutes + MIN_STAY)),
    })),
  setEnd: (minutes) =>
    set((state) => ({
      endMinutes: Math.max(minutes, state.startMinutes + MIN_STAY),
    })),
  setPaymentMethod: (paymentMethodId) => set({ paymentMethodId }),
  confirm: (booking) => set({ lastConfirmed: booking }),
  reset: () =>
    set({
      parkingId: null,
      date: toIsoDate(new Date()),
      startMinutes: defaultStart(),
      endMinutes: defaultStart() + 4 * 60,
      paymentMethodId: null,
    }),
}));
