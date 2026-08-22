# Arquitectura

## Stack

| Capa | Elección | Por qué |
|---|---|---|
| Runtime | React Native 0.86 + Expo SDK 57 | Un código para iOS, Android y web; OTA y builds sin Xcode local |
| Lenguaje | TypeScript `strict` + `noUncheckedIndexedAccess` | El modelo de dominio es el contrato con el backend futuro |
| Navegación | `expo-router` (rutas por archivo, tipadas) | El árbol de archivos *es* el mapa de la app |
| Estado | Zustand (+ `persist` sobre AsyncStorage) | Cuatro slices pequeños; sin boilerplate ni context hell |
| Animación | Reanimated 4 + Gesture Handler | Corre en el hilo de UI: el mapa y el sheet no se traban |
| Sheets | `@gorhom/bottom-sheet` | Detents reales, como los de iOS |
| Iconos | `lucide-react-native` | Una sola familia, grosor consistente |
| Imágenes | `expo-image` | Caché, transiciones y `contentFit` correctos |

## Capas

```
 app/ (rutas)          →  composición y navegación, nada más
   ↓
 components/           →  presentación pura, props tipadas
   ↓
 store/ (zustand)      →  estado de sesión, búsqueda, reserva y borradores
   ↓
 services/             →  frontera asíncrona; hoy mocks, mañana Supabase
   ↓
 mocks/ · utils/       →  datos de ejemplo y cálculo puro
```

Regla dura: **una pantalla nunca importa de `mocks/`**. Siempre pasa por
`services/`, para que el día que cambie el origen de datos no haya que tocar la
UI.

## La frontera de datos

Todos los servicios pasan por `services/client.ts`:

```ts
request(() => clone(parkings));   // resuelve entre 240 y 520 ms
```

Esto no es decoración: obliga a que cada pantalla tenga estados de carga y de
error reales desde el primer día. `useAsync` los expone (`data`, `loading`,
`error`, `reload`, `refreshing`).

### Cómo se conecta Supabase después

1. `services/*.ts` cambia el cuerpo de cada función por una consulta al cliente
   de Supabase. Las firmas y los tipos de retorno no se tocan.
2. `useAsync` se reemplaza por React Query si hace falta caché e invalidación;
   la forma que consumen las pantallas es la misma.
3. `mocks/` queda solo para tests y para el modo demo.

Mapeo previsto de tablas: `parkings`, `parking_photos`, `parking_features`,
`opening_hours`, `bookings`, `reviews`, `profiles`, `payment_methods`,
`owner_payouts`. Los tipos de `src/types/index.ts` son el punto de partida para
generar el esquema.

## El mapa

`src/components/map/` expone un único símbolo a las pantallas: `MapView`, con la
firma de `MapViewProps`.

Hoy lo implementa `MapCanvas`, que dibuja una ciudad abstracta en SVG y proyecta
las coordenadas reales sobre un lienzo mayor que la pantalla. El paneo mueve ese
lienzo con Reanimated en vez de recalcular posiciones, así que arrastrar el mapa
no cuesta renders.

Para pasar a mapas reales basta escribir un componente que cumpla
`MapViewProps` y cambiar el `export` de `index.ts`. Ninguna pantalla cambia.
Candidatos: Google Maps (requiere key por plataforma y facturación) o
Mapbox/MapLibre (token gratuito y mucho más control del estilo, que encaja mejor
con un mapa desaturado donde los marcadores son el contenido).

## Precios

`utils/pricing.ts` es la única fuente de verdad: cobro por bloques de 30 minutos
con mínimo de una hora, tope por tarifa diaria cuando el propietario la define, y
comisión de servicio del 10 % con mínimo de $ 900. La pantalla de reserva, el
checkout y los datos mock usan la misma función, así que el total nunca se
contradice entre pantallas.

## Rendimiento

- Listas con `FlatList` y `keyExtractor` estable; `ParkingRow` y `BookingRow` van
  memoizados.
- Los marcadores se proyectan una sola vez por región (`useMemo`), incluida la
  pasada que evita solapamientos.
- Las animaciones viven en el hilo de UI (Reanimated); no hay `setState` por
  frame.
- Selectores de Zustand por campo: cambiar un filtro no re-renderiza el mapa
  entero.

## Accesibilidad

- Escala tipográfica tomada de las métricas Dynamic Type de iOS (tamaño Large) y
  del tracking real de SF Pro.
- Área táctil mínima de 44 pt en todo control (`IconButton` mide 44×44 aunque el
  glifo sea de 16).
- El estado nunca depende solo del color: los chips seleccionados cambian fondo,
  borde y color de etiqueta a la vez.
- `accessibilityLabel`, `accessibilityHint` y `accessibilityState` en cada
  control; `accessibilityRole="tablist"` en el control segmentado.
