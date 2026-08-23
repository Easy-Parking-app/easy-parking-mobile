import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from '@/types/database';

/**
 * Cliente de Supabase.
 *
 * Todavia no lo usa ninguna pantalla: los servicios siguen leyendo de `/mocks`.
 * Esta aqui para que conectar cada servicio sea cambiar el cuerpo de una
 * funcion y no montar la infraestructura entera de una sentada.
 *
 * La clave anon viaja dentro del binario, o sea que es publica por diseno. Lo
 * que separa los datos de un usuario de los de otro son las politicas de RLS,
 * no esconder esta cadena.
 */

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Fallar aqui y no en la primera consulta: el error real es un `.env.local`
  // que falta, y conviene que lo diga asi en vez de un 401 sin contexto.
  throw new Error(
    'Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copia .env.example a .env.local y rellena los valores.',
  );
}

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // En movil no hay URL de la que leer el token del magic link; en web si.
    detectSessionInUrl: Platform.OS === 'web',
  },
});

/**
 * Refrescar el token solo mientras la app esta en primer plano.
 *
 * Sin esto el temporizador sigue corriendo en segundo plano, gasta bateria y
 * dispara peticiones que el sistema puede matar a media conexion. En web no
 * aplica: no hay AppState que valga.
 */
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}
