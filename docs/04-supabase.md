# Supabase

El proyecto ya existe y la base ya tiene esquema. **Ninguna pantalla lo usa
todavía**: los servicios siguen leyendo de `src/mocks`. Este documento explica
qué hay montado y cómo enchufarlo.

| | |
|---|---|
| Proyecto | `easy-parking` |
| Referencia | `ptkgshahkvqgxkzbjgke` |
| Región | `us-east-1` |
| URL | `https://ptkgshahkvqgxkzbjgke.supabase.co` |
| Panel | <https://supabase.com/dashboard/project/ptkgshahkvqgxkzbjgke> |

`us-east-1` y no `sa-east-1`: São Paulo suena más cerca de Bogotá, pero el
tráfico colombiano hacia internet enruta por Miami, y la latencia real a
Virginia es menor.

---

## Puesta en marcha

```bash
cp .env.example .env.local
```

Rellena `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` con los
valores del panel (**Project Settings → API Keys**).

La clave anon viaja dentro del binario de la app, así que **es pública por
diseño**. No es un secreto que se filtró: lo que separa los datos de un usuario
de los de otro son las políticas de RLS. La que sí es un secreto es la
`service_role`, que **no se usa en la app** y no debe acabar nunca en el
repositorio ni en el teléfono.

---

## El esquema

Nueve tablas, todas con RLS activo.

```
profiles          extiende auth.users con lo que la app muestra de una persona
parkings          el listado; lat/lng + columna PostGIS generada
  parking_photos  fotos, con orden propio
  parking_features amenidades, una fila por característica
  parking_hours   horarios por día de la semana, en minutos desde medianoche
reviews           una por persona y parqueadero
payment_methods   solo el enmascarado que se pinta; los datos reales no entran
bookings          reservas, con el desglose de precio congelado
favorites         relación usuario ↔ parqueadero
```

Las migraciones están en [`supabase/migrations/`](../supabase/migrations) y son
la fuente de verdad. Cada archivo explica en comentarios por qué está hecho así.

### Tres decisiones que conviene conocer antes de tocar nada

**1. Los enums son los mismos literales del front.** `parking_kind`,
`feature_key`, `booking_status`, `payment_kind` y `listing_status` repiten
exactamente las cadenas de `src/types/index.ts`. Añadir una amenidad es un valor
más en el enum, no una tabla nueva.

**2. Reservar no se hace con un `INSERT`.** Se llama a la función
`create_booking(parking_id, starts_at, ends_at, payment_method_id)`. El motivo
es real: si la app leyera `spots_available`, decidiera y luego insertara, dos
personas podrían pasar la comprobación a la vez y llevarse el mismo cupo. La
función bloquea la fila del parqueadero (`FOR UPDATE`), comprueba y descuenta,
todo en una transacción.

Además **calcula el precio en el servidor**, con las mismas reglas de
`src/utils/pricing.ts`. Un cliente puede mentir sobre cuánto cuesta algo; el
servidor no le hace caso.

Cancelar es simétrico: `cancel_booking(id)` devuelve el cupo.

> Si cambias las reglas de precio en `src/utils/pricing.ts`, hay que cambiarlas
> también en `create_booking`. Es la única duplicación deliberada del proyecto y
> está aquí porque la alternativa —confiar el precio al cliente— es peor.

**3. La búsqueda por cercanía usa PostGIS.** `parkings.location` es una columna
generada a partir de `latitude`/`longitude`, con índice GIST. La función
`parkings_nearby(lat, lng, radio, límite)` devuelve ids y distancia ya
calculada, ordenados. PostgREST no sabe pedirle a PostGIS que ordene por
distancia, de ahí que sea una función y no una consulta armada en el cliente.

---

## Cómo conectar un servicio

La capa de servicios se diseñó para esto: `src/services/client.ts` es un
transporte falso con latencia, y todas las pantallas ya manejan sus estados de
carga y error. Conectar un servicio es cambiar el cuerpo de sus funciones.

`src/types/database.ts` tiene los tipos de las filas tal como salen de Postgres
—snake_case, ids planos, relaciones sin resolver—. **No son los tipos de la
UI.** El modelo de la UI sigue siendo `src/types/index.ts`, y la traducción
entre ambos vive en `services/`. Esa frontera es la que permite cambiar el
esquema sin tocar ninguna pantalla.

Regenerar los tipos después de cada migración:

```bash
npm run types:supabase
```

Necesita el CLI de Supabase y `SUPABASE_ACCESS_TOKEN` en el entorno.

---

## Lo que falta

- **Autenticación.** No hay pantallas de registro, login ni recuperar
  contraseña, y `useSessionStore` sigue arrancando con el usuario de
  `src/mocks/user.ts`. Es el siguiente bloque y el más grande.
- **Storage** para las fotos. El asistente de publicación las recoge con
  `expo-image-picker` y hoy no tiene dónde dejarlas. Falta el bucket y sus
  políticas.
- **Datos semilla.** Las tablas están vacías. Los 12 parqueaderos de
  `src/mocks/parkings.ts` sirven de semilla cuando exista un usuario propietario
  al que colgarlos.
- **Realtime** para que el cupo disponible se actualice solo.
- Marcar reservas como `activa` y `completada` según la hora. Hoy nada las mueve
  de `proxima`; hace falta un cron (`pg_cron`) o una Edge Function.
