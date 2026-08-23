# Easy Parking

Marketplace de parqueaderos para Colombia. App móvil para **iOS, Android y web**
construida con React Native + Expo + TypeScript.

Esta fase usa **datos mock**: no hay backend, ni autenticación real, ni pagos
reales. La arquitectura está preparada para conectar Supabase sin tocar la UI.

---

## Arranque rápido

```bash
npm install
npm start
```

Luego abre la app en Expo Go escaneando el QR, o pulsa `w` para abrirla en el
navegador.

| Comando | Qué hace |
|---|---|
| `npm start` | Servidor de desarrollo (Metro) |
| `npm run start:lan` | Fuerza la IP de la red local, por si el QR apunta a un adaptador virtual |
| `npm run start:tunnel` | Túnel: funciona aunque el celular esté en otra red |
| `npm run ios` / `npm run android` | Abre en simulador o dispositivo |
| `npm run web` | Abre la versión web |
| `npm run typecheck` | `tsc --noEmit` — debe pasar antes de cada commit |

El proyecto está fijado a **Expo SDK 54**, que es la versión que soporta el Expo
Go publicado en las tiendas. Ver [`docs/01-arquitectura.md`](docs/01-arquitectura.md#versión-del-sdk-y-expo-go)
antes de subir de SDK.

---

## Estructura

```
app/                    Rutas (expo-router). Solo composición, sin lógica.
  (tabs)/               Explorar · Reservas · Favoritos · Perfil
  parqueadero/[id]      Detalle
  reservar/[id]         Elección de horario
  checkout              Pago (simulado)
  confirmacion          Recibo
  reserva/[id]          Detalle de una reserva
  propietario/          Modo propietario (stack propio)
src/
  components/ui/        Sistema de diseño: Text, Button, Chip, Row, Sheet…
  components/map/       Abstracción de mapa (hoy un mapa dibujado)
  components/parking/   Fila, tarjeta de vista previa, galería, reseñas
  components/booking/   Fecha, hora, resumen de precio, métodos de pago
  components/owner/     Pasos de publicación, gráfico de ingresos
  constants/            theme.ts (tokens) y catalog.ts (etiquetas e iconos)
  services/             Capa asíncrona; hoy lee de /mocks, mañana de Supabase
  store/                Zustand: sesión, búsqueda, reserva, favoritos, borrador
  types/                Modelo de dominio
  mocks/                Datos de ejemplo (12 parqueaderos de Bogotá)
  utils/                Formato, geometría, precios, disponibilidad
  hooks/                useAsync
```

Documentación detallada en [`docs/`](docs/):

- [`00-producto.md`](docs/00-producto.md) — qué construimos y qué aprendimos del prototipo v0
- [`01-arquitectura.md`](docs/01-arquitectura.md) — decisiones técnicas y ruta hacia Supabase
- [`02-design-system.md`](docs/02-design-system.md) — identidad visual y tokens
- [`03-mapas.md`](docs/03-mapas.md) — plan para pasar a mapas reales y qué proveedor usar

---

## Reglas del proyecto

1. **Ningún valor visual se escribe a mano.** Colores, tipografías, espaciados,
   radios, sombras y duraciones salen de `src/constants/theme.ts`.
2. **Las pantallas no contienen lógica de negocio.** Consultan servicios y
   stores; el cálculo vive en `src/utils` y `src/services`.
3. **Todo elemento interactivo tiene `accessibilityLabel`** y un área táctil de
   44 pt como mínimo.
4. **`npm run typecheck` en verde** antes de abrir un PR.

## Estado

- ✅ Conductor: mapa, búsqueda, filtros, detalle, reserva, checkout, confirmación,
  mis reservas, favoritos, perfil.
- ✅ Propietario: inicio con ingresos, gestión de reservas, detalle de ingresos,
  publicación en 8 pasos.
- ⏳ Pendiente: Supabase (auth, datos, storage, realtime), pagos reales, mapas
  reales, notificaciones, verificación de llegada con fotos.
