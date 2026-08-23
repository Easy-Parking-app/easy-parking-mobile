# Mapas reales

Hoy la app dibuja su propio mapa (`src/components/map/MapCanvas.tsx`). No
consume ninguna API y funciona en iOS, Android y web. Este documento es el plan
para cuando queramos tiles de verdad.

**La abstracción ya está.** `src/components/map/types.ts` define `MapViewProps`.
Basta escribir un componente que cumpla esa firma y cambiar el `export` de
`src/components/map/index.ts`. Ninguna pantalla se toca.

---

## Recomendación: Google Maps

Para una app **móvil** en **Colombia**, Google Maps es la mejor opción, por dos
razones que pesan más que cualquier otra consideración:

### 1. En móvil, el mapa es gratis sin límite

Google Maps Platform reestructuró sus precios: los SKU **Maps SDK for Android** y
**Maps SDK for iOS** figuran con uso gratuito **ilimitado** — no se cobra por
carga de mapa. Lo que sí se cobra es el resto de servicios (geocodificación,
autocompletado, direcciones), con 10.000 llamadas gratis al mes en el nivel
Essentials y facturación a partir de ahí.

Traducido a nuestro caso: **pintar el mapa con los marcadores de precio no cuesta
nada, por muchos usuarios que tengamos.** El gasto solo aparecería si usamos
geocodificación intensivamente, y eso se controla.

### 2. Los datos de Bogotá son mucho mejores

OpenStreetMap tiene buena cobertura de vías en Bogotá, pero floja en
direcciones tipo "Carrera 15 # 85-32", nombres de edificios y puntos de interés.
Para un marketplace donde el conductor busca por dirección o por "Zona T", esa
diferencia se nota en la primera búsqueda. Google también es lo que el usuario
colombiano ya tiene instalado y espera.

### 3. Y funciona en Expo Go

**`react-native-maps` viene incluido en Expo Go.** Se puede probar el mapa real
escaneando el QR, sin development build. Solo hace falta configurar las claves
para compilar los binarios de las tiendas.

### Lo que hay que aceptar

- **Exige cuenta de facturación con tarjeta**, aunque el uso caiga en la capa
  gratuita. Sin tarjeta no dan la API key. (En nuestra cuenta ya estaba activa,
  así que este paso no hizo falta.)
- **Hay que poner límites el primer día**, no después: cuotas por API en Google
  Cloud y alertas de presupuesto. Es lo que evita una factura sorpresa si la
  geocodificación se dispara por un bug.
- Los usuarios nuevos tienen **300 USD de crédito por 90 días**, así que la fase
  de desarrollo no cuesta nada.

---

## Alternativas, y cuándo tendrían sentido

| | Google Maps | Geoapify | MapTiler | Mapbox |
|---|---|---|---|---|
| Mapa en móvil | **Gratis ilimitado** | 3.000 créditos/día | 100.000 pet./mes | 50.000 cargas/mes |
| ¿Tarjeta? | **Sí** | No | No | Sí |
| ¿Uso comercial gratis? | Sí | Sí, limitado | **No** | Sí |
| Datos en Colombia | **Los mejores** | OSM | OSM | OSM + propios |
| Control del estilo | Medio | Alto | Alto | **El más alto** |
| Soporte web | Otra librería | Sí | Sí | Sí |

- **Geoapify** — la opción si en algún momento no queremos dar tarjeta, o para
  geocodificación barata en paralelo a Google.
- **MapTiler** — los estilos más bonitos, pero su plan gratis es explícitamente
  **no comercial**: sirve para maquetar, no para lanzar.
- **Mapbox** — el mayor control visual; tiene sentido el día que el mapa sea
  parte central de la identidad y queramos diseñarlo en Mapbox Studio.

---

## Lo que ya está hecho

La cuenta de Google Cloud ya está configurada. Para trabajar solo hace falta
copiar `.env.example` a `.env.local` y pedir las claves.

| | |
|---|---|
| Proyecto GCP | `Easy Parking` (`project-bb24b33c-cba3-4349-bb5`) |
| APIs habilitadas | *Maps SDK for Android*, *Maps SDK for iOS*, y nada más |
| Clave Android | `Easy Parking - Android`, restringida a *Maps SDK for Android* |
| Clave iOS | `Easy Parking - iOS`, restringida a *Maps SDK for iOS* + bundle `app.easyparking.mobile` |
| Credenciales | <https://console.cloud.google.com/apis/credentials?project=project-bb24b33c-cba3-4349-bb5> |

**Son dos claves y no una a propósito**: una clave de Google admite un solo tipo
de restricción de aplicación, así que Android e iOS no pueden compartirla si
queremos las dos restringidas.

`react-native-maps` ya está instalado (1.20.1, la versión que corresponde a
Expo SDK 54, incluida en Expo Go).

### Lo que falta cerrar en la consola

- **Restricción de aplicación en la clave de Android.** Quedó en *Ninguno*
  porque hace falta la huella SHA-1 del certificado de firma, y esa no existe
  hasta la primera compilación. Cuando la haya:

  ```bash
  eas credentials
  ```

  y en la consola: la clave → *Restricciones de aplicaciones* → *Apps para
  Android* → package `app.easyparking.mobile` + la huella.

  Mientras tanto el riesgo es acotado: la clave solo puede llamar al *Maps SDK
  for Android*, que **no factura**. Aunque se filtrara, no genera cobro.

- **Presupuesto y alertas.** En **Billing → Budgets & alerts**, un presupuesto
  con avisos al 50 %, 90 % y 100 %. No es urgente hoy —ninguna API de pago está
  habilitada—, pero sí el día que se active geocodificación.

- **Borrar la clave sobrante.** Al habilitar los SDK, Google creó sola una
  `Maps Platform API Key` abierta a 35 APIs. No la usa nadie. Conviene borrarla
  desde la página de credenciales.

## Cómo se configuró en el proyecto

Las claves llegan por entorno y **no están en ningún archivo versionado**:

```bash
# .env.local  (ignorado por git)
EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID=...
EXPO_PUBLIC_GOOGLE_MAPS_KEY_IOS=...
```

`react-native-maps` **no trae config plugin**, así que las claves no se
configuran con una entrada en `plugins`. Van en `ios.config.googleMapsApiKey` y
`android.config.googleMaps.apiKey`. Como `app.json` no puede leer variables de
entorno, existe [`app.config.ts`](../app.config.ts): extiende el JSON e inyecta
esos dos valores. Comprobar el resultado con

```bash
npx expo config --type prebuild
```

(`--type public` las omite a propósito: ese manifiesto es el que ven los
clientes.)

Para compilar en la nube hay que subirlas también a EAS:

```bash
eas secret:create --name EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID --value la_clave
eas secret:create --name EXPO_PUBLIC_GOOGLE_MAPS_KEY_IOS     --value la_clave
```

## Lo que falta: el componente

### 1. Escribir el componente

Un solo archivo, `src/components/map/MapGoogleView.tsx`, que cumpla
`MapViewProps`:

- `provider={PROVIDER_GOOGLE}` en el `MapView`.
- `markers` → `<Marker>` con el `PriceMarker` que ya existe como hijo
  (`tracksViewChanges={false}` después del primer render, o los marcadores
  personalizados destrozan el rendimiento en Android).
- `focus` → `mapRef.animateCamera({ center }, { duration })`, con `topInset` y
  `bottomInset` como `mapPadding` para que el marcador no quede tras la hoja.
- La pasada que separa marcadores solapados se puede quitar: conviene pasar a
  *clustering* real.

### 2. Estilo — importante para no perder la identidad

El estilo por defecto de Google es saturado y compite con nuestras píldoras de
precio. Hay que desaturarlo con `customMapStyle`: un JSON que baje la saturación,
deje las vías en blanco y reduzca los POI. La referencia es lo que ya dibuja
`MapBackdrop`: gris claro, vías blancas, etiquetas discretas, verde solo en
parques.

Sin ese paso el mapa se ve como cualquier otra app y perdemos lo que más
distingue la pantalla principal.

### 3. Conservar el mapa dibujado para web

`react-native-maps` no soporta web. En `index.ts`:

```ts
import { Platform } from 'react-native';
export const MapView = Platform.OS === 'web' ? MapCanvas : MapGoogleView;
```

Así la versión web sigue funcionando y no perdemos la superficie de QA rápida.

---

## Geocodificación

La búsqueda actual solo encuentra parqueaderos de los datos mock. Para resolver
direcciones reales hay dos caminos:

- **Google Geocoding / Places Autocomplete** — la mejor calidad en Colombia,
  10.000 llamadas gratis al mes y luego se paga. Conviene *debounce* agresivo y
  cachear resultados: es el único punto donde el mapa nos puede costar dinero.
- **Nominatim (OpenStreetMap)** — gratis y sin registro, pero su política limita
  a 1 petición por segundo y exige un `User-Agent` identificable. Sirve para
  desarrollo, no para producción.

Va en `src/services/parkings.ts`, dentro de `fetchSuggestions`, mezclando los
resultados reales con las zonas de Bogotá que ya sugerimos. La firma no cambia.
