/**
 * Fake transport for the mock services.
 *
 * Every service function goes through `request`, so when Supabase replaces the
 * mocks the call sites and their loading/error states stay exactly as they are.
 */

const MIN_LATENCY = 240;
const MAX_LATENCY = 520;

const randomLatency = () =>
  MIN_LATENCY + Math.round(Math.random() * (MAX_LATENCY - MIN_LATENCY));

export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ServiceError';
  }
}

/** Resolves `value` after a realistic delay. */
export function request<T>(value: T | (() => T), latency = randomLatency()): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(typeof value === 'function' ? (value as () => T)() : value);
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new ServiceError('No pudimos completar la operación.'),
        );
      }
    }, latency);
  });
}

/** Deep-clones mock records so callers can never mutate the fixtures. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
