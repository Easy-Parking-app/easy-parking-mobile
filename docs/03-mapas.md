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
  gratuita. Sin tarjeta no dan la API key.
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

## Cómo hacerlo

### 1. Obtener la clave

1. <https://console.cloud.google.com/> → crear proyecto `easy-parking`.
2. Activar facturación (pide tarjeta).
3. **APIs & Services → Enable APIs** → habilitar *Maps SDK for Android* y
   *Maps SDK for iOS*. Nada más por ahora: cada API habilitada es superficie
   que puede generar cobro.
4. **Credentials → Create credentials → API key**.

### 2. Restringir la clave antes de usarla

Esto no es opcional. Una clave abierta la puede usar cualquiera y la factura
llega a nosotros.

- **Application restrictions**
  - Android: *Android apps* → package `app.easyparking.mobile` + huella SHA-1
    del certificado (la da `eas credentials`).
  - iOS: *iOS apps* → bundle ID `app.easyparking.mobile`.
- **API restrictions** → solo los dos SDK de mapas.

### 3. Poner un techo de gasto

En **Billing → Budgets & alerts**, presupuesto con avisos al 50 %, 90 % y 100 %.
Y en **APIs & Services → Quotas**, un tope diario de peticiones por API. El
presupuesto avisa; la cuota es la que de verdad corta.

### 4. Configurar el proyecto

La clave no se escribe en el código:

```bash
# .env.local  (ignorado por git)
EXPO_PUBLIC_GOOGLE_MAPS_KEY=la_clave
```

```bash
eas secret:create --name EXPO_PUBLIC_GOOGLE_MAPS_KEY --value la_clave
```

En `app.json`:

```json
["react-native-maps", {
  "androidGoogleMapsApiKey": "$EXPO_PUBLIC_GOOGLE_MAPS_KEY",
  "iosGoogleMapsApiKey": "$EXPO_PUBLIC_GOOGLE_MAPS_KEY"
}]
```

```bash
npx expo install react-native-maps
```

### 5. Escribir el componente

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

### 6. Estilo — importante para no perder la identidad

El estilo por defecto de Google es saturado y compite con nuestras píldoras de
precio. Hay que desaturarlo con `customMapStyle`: un JSON que baje la saturación,
deje las vías en blanco y reduzca los POI. La referencia es lo que ya dibuja
`MapBackdrop`: gris claro, vías blancas, etiquetas discretas, verde solo en
parques.

Sin ese paso el mapa se ve como cualquier otra app y perdemos lo que más
distingue la pantalla principal.

### 7. Conservar el mapa dibujado para web

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
