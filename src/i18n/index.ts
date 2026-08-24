import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

import { en } from './locales/en';
import { es, type TranslationKey } from './locales/es';

/**
 * Traducciones.
 *
 * El español es el idioma fuente y el de respaldo: la app se escribe en
 * español, y los demás catálogos se generan de ahí con `npm run translate`.
 * Si a un idioma le falta una clave, cae al español antes que mostrar la clave
 * cruda, que es lo peor que puede ver alguien.
 *
 * No se traduce nada en tiempo de ejecución. Llamar a una API de traducción
 * desde el teléfono costaría dinero por cada pantalla, necesitaría red —y esta
 * app se usa en sótanos— y traduciría la misma palabra distinto en cada sitio.
 * Las traducciones se generan una vez, se revisan y se versionan.
 */

export const locales = { es, en } as const;

export type Locale = keyof typeof locales;

export const availableLocales = Object.keys(locales) as Locale[];

const i18n = new I18n(locales);

i18n.defaultLocale = 'es';
i18n.enableFallback = true;

/** El idioma del teléfono, si lo hablamos; si no, español. */
export function deviceLocale(): Locale {
  const preferred = getLocales();
  for (const { languageCode } of preferred) {
    if (languageCode && availableLocales.includes(languageCode as Locale)) {
      return languageCode as Locale;
    }
  }
  return 'es';
}

export function setLocale(locale: Locale) {
  i18n.locale = locale;
}

setLocale(deviceLocale());

/**
 * Traduce una clave.
 *
 * `TranslationKey` sale de las claves del catálogo español, así que una clave
 * mal escrita —o que se quedó atrás al renombrar— es un error de compilación y
 * no un texto raro descubierto en producción.
 */
export function t(key: TranslationKey, params?: Record<string, string | number>) {
  return i18n.t(key, params);
}

export type { TranslationKey };
