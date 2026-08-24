import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from './index';

/**
 * `t` con re-render al cambiar de idioma.
 *
 * `t` a secas funciona, pero es una función normal: si alguien cambia el idioma
 * en Configuración, las pantallas ya montadas se quedan como estaban hasta que
 * algo las obligue a repintarse. Leer la preferencia desde la store suscribe al
 * componente, así que un cambio de idioma repinta todo lo que traduce.
 *
 * Se usa en componentes. Fuera de React —servicios, utilidades— se importa `t`
 * directamente desde `@/i18n`.
 */
export function useT() {
  useSettingsStore((state) => state.language);
  return t;
}
