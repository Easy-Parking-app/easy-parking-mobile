# Mapas reales

Hoy la app dibuja su propio mapa (`src/components/map/MapCanvas.tsx`). No
consume ninguna API y funciona en iOS, Android y web. Este documento es el plan
para cuando queramos tiles de verdad.

## Antes de empezar: dos cosas que hay que saber

1. **Cualquier SDK de mapas es un módulo nativo.** Eso significa que deja de
   funcionar en Expo Go y hay que pasar a un *development build*
   (`eas build --profile development`). Es un cambio de flujo de trabajo, no solo
   una dependencia más.
2. **La abstracción ya está.** `src/components/map/types.ts` define
   `MapViewProps`. Basta escribir un componente nuevo que cumpla esa firma y
   cambiar el `export` de `src/components/map/index.ts`. Ninguna pantalla se
   toca.

## Proveedor recomendado: Geoapify

| | Geoapify | MapTiler | Google Maps | Mapbox |
|---|---|---|---|---|
| Plan gratis | 3.000 créditos/día | 100.000 peticiones/mes | Capa gratuita mensual | 50.000 cargas/mes |
| ¿Tarjeta al registrarse? | No | No | **Sí** | **Sí** |
| ¿Uso comercial en el plan gratis? | Sí, limitado, con atribución | **No** — solo pruebas y uso personal | Sí | Sí |
| Estilos desaturados | Sí (`positron`) | Sí | Requiere estilo personalizado | Sí (Studio) |

**Geoapify** es la mejor opción para nosotros ahora: no pide tarjeta, permite uso
comercial limitado y con una sola clave cubre *tiles*, geocodificación y mapas
estáticos. Cuando el volumen supere el plan gratis, Google o Mapbox son los
siguientes pasos naturales — para entonces ya habrá con qué pagarlo.

MapTiler tiene los estilos más bonitos y una cuota mucho mayor, pero su plan
gratuito es explícitamente **no comercial**, así que sirve para maquetar, no para
lanzar.

## Cómo obtener la clave

1. Crear cuenta en <https://myprojects.geoapify.com/register> (correo, sin
   tarjeta).
2. **New project** → nombre `easy-parking`.
3. Copiar la **API key** que se genera.
4. En *Settings* del proyecto, restringir la clave antes de usarla en
   producción:
   - **Allowed domains** → los dominios de la web (`easyparking.app`).
   - **Allowed bundle IDs / package names** → `app.easyparking.mobile`, que es
     el identificador que ya usa `app.json` en iOS y Android.

Sin esas restricciones la clave queda abierta a que cualquiera la use y consuma
la cuota.

## Configuración en el proyecto

La clave no se escribe en el código. Va por variable de entorno:

```bash
# .env.local  (ignorado por git)
EXPO_PUBLIC_MAP_API_KEY=la_clave_de_geoapify
```

Expo expone al bundle cualquier variable con prefijo `EXPO_PUBLIC_`. Para los
builds de EAS se sube como secreto:

```bash
eas secret:create --name EXPO_PUBLIC_MAP_API_KEY --value la_clave
```

Y se lee en un único sitio, nunca repartida por el código:

```ts
// src/constants/config.ts
export const mapApiKey = process.env.EXPO_PUBLIC_MAP_API_KEY ?? '';
export const mapStyleUrl =
  `https://maps.geoapify.com/v1/styles/positron/style.json?apiKey=${mapApiKey}`;
```

### Estilo

Usar **`positron`**: gris claro, calles blancas, etiquetas discretas. Es
exactamente la dirección del mapa que dibujamos a mano, y es la que deja que las
píldoras de precio sean lo único con contraste en pantalla. Los estilos
saturados (`osm-carto`, `osm-bright`) compiten con los marcadores y rompen la
identidad.

Otras opciones del mismo proveedor si algún día hace falta: `positron-blue`,
`dark-matter` (para un modo oscuro futuro), `osm-bright-grey`.

### Librería

```bash
npx expo install @maplibre/maplibre-react-native
```

MapLibre es open source y consume el estilo de cualquier proveedor, así que
cambiar de Geoapify a MapTiler o a tiles propios más adelante es cambiar una URL.
Evita el bloqueo con un proveedor, que es justo lo que queremos en la capa que
más caro sale escalar.

`react-native-maps` es la alternativa, pero ata el proyecto a Google/Apple y da
mucho menos control del estilo.

### Qué hay que escribir

Un solo archivo, `src/components/map/MapLibreView.tsx`, que cumpla
`MapViewProps`:

- `markers` → `MarkerView` con el mismo `PriceMarker` que ya existe.
- `userLocation` → `UserLocation` de MapLibre, o el `UserDot` actual.
- `focus` → `camera.setCamera({ centerCoordinate, padding })`, usando
  `topInset` / `bottomInset` como padding para que el marcador no quede detrás
  de la hoja.
- La pasada que separa marcadores solapados puede desaparecer: MapLibre tiene
  *clustering* nativo, que es mejor solución a partir de cierta densidad.

Y en `index.ts`:

```ts
export { MapLibreView as MapView } from './MapLibreView';
```

Conviene **conservar `MapCanvas`** y elegir la implementación según plataforma:
MapLibre no soporta web, y el mapa dibujado sí. Es la forma de no perder la
versión web.

## Geocodificación

La búsqueda actual solo encuentra parqueaderos de los datos mock. Con la misma
clave de Geoapify se resuelve una dirección real:

```
https://api.geoapify.com/v1/geocode/autocomplete?text=calle+85&filter=countrycode:co&apiKey=...
```

Va en `src/services/parkings.ts`, dentro de `fetchSuggestions`, mezclando los
resultados reales con las zonas de Bogotá que ya sugerimos. La firma no cambia.

Alternativa sin clave: **Nominatim** (OpenStreetMap), gratis y sin registro, pero
su política de uso limita a 1 petición por segundo y exige un `User-Agent`
identificable. Sirve para desarrollo, no para producción.
