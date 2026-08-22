import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Shared storage adapter so every persisted slice behaves identically. */
export const storage = createJSONStorage(() => AsyncStorage);

/** Namespaced key, so wiping Easy Parking data is a single prefix scan. */
export const storeKey = (name: string) => `easy-parking:${name}`;
