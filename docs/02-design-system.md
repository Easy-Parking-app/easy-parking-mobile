# Sistema de diseño

Fuente de verdad: [`src/constants/theme.ts`](../src/constants/theme.ts).
Si un valor no está ahí, no se usa.

## Identidad

Easy Parking no es una app azul de movilidad más. La decisión de partida es que
**el color primario de acción es tinta, casi negro**, y el acento aparece solo
donde hay que dirigir la mirada: selección, estados activos, enlaces y el punto
de tu ubicación. Eso hace que la app se lea como una herramienta precisa y no
como una plantilla, y la separa del prototipo web (que era azul saturado de
extremo a extremo).

La fotografía y el precio son el color. Todo lo demás es tinta, gris y aire.

## Color

| Token | Valor | Uso |
|---|---|---|
| `bg` | `#FFFFFF` | Fondo de página |
| `surface` | `#F4F5F7` | Rellenos tranquilos: píldora de búsqueda, chips inactivos |
| `surfaceAlt` | `#ECEEF2` | Un paso más profundo, para rellenos anidados |
| `hairline` | `#E3E6EC` | Separadores de 1 px |
| `ink` | `#0A0D12` | Texto principal **y fondo de los botones primarios** |
| `inkSecondary` | `#5B6472` | Texto de apoyo |
| `inkTertiary` | `#8C94A1` | Metadatos, placeholders |
| `accent` | `#3D3BE8` | Selección, estados activos, enlaces, punto de ubicación |
| `accentSoft` | `#EEEEFD` | Fondo del acento |
| `available` | `#12A150` | "Disponible ahora" |
| `scarce` | `#E8850C` | "Pocos cupos" |
| `danger` | `#D92D20` | Errores y acciones destructivas |

El estado nunca se comunica solo con color: la disponibilidad lleva etiqueta, los
chips seleccionados cambian fondo, borde y color de texto a la vez.

## Tipografía

Escala tomada de las métricas Dynamic Type de iOS (tamaño **Large**, el valor por
defecto) con el tracking real de SF Pro por tamaño. Es la razón por la que los
títulos grandes llevan tracking **positivo**: es lo que hace el sistema, no un
gusto personal.

| Variante | Tamaño / interlineado | Peso | Tracking | Uso |
|---|---|---|---|---|
| `display` | 34 / 41 | 700 | +0.40 | Títulos de pestaña, código de reserva |
| `title1` | 28 / 34 | 700 | +0.38 | Título de pantalla |
| `title2` | 22 / 28 | 700 | −0.26 | Encabezados de sección grandes |
| `title3` | 20 / 25 | 600 | −0.45 | Nombre en tarjetas, totales |
| `headline` | 17 / 22 | 600 | −0.43 | Etiquetas de botón, nombres en filas |
| `body` | 17 / 22 | 400 | −0.43 | Texto corrido |
| `callout` | 16 / 21 | 400 | −0.31 | Descripciones, filas de lista |
| `subhead` | 15 / 20 | 500 | −0.23 | Texto de apoyo |
| `footnote` | 13 / 18 | 500 | −0.08 | Metadatos |
| `caption` | 12 / 16 | 500 | 0 | Etiquetas pequeñas |
| `caption2` | 11 / 13 | 600 | +0.06 | Badges, etiquetas de pestaña |
| `overline` | 11 / 14 | 700 | +0.60 | Encabezado de sección, en mayúsculas |

Un solo componente de texto (`<Text variant color>`); las pantallas nunca tocan
`fontSize`.

## Espacio y forma

- Rejilla base de 4: `2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.
- Margen de página: **20**. Todo lo de ancho completo se alinea ahí.
- Radios: `xs 8 · sm 12 · md 16 · lg 20 · xl 28 · pill 999`.
  Los botones usan `sm`, las tarjetas `md`, las hojas `xl`.
- Alturas de control: `sm 36 · md 44 · lg 52`.

## Profundidad

Tres niveles, todos suaves. Nada más:

- `raised` — tarjetas y botones flotantes (opacidad 0.06, radio 12).
- `floating` — controles sobre el mapa o sobre fotografía (0.10, radio 20).
- `sunken` — la barra inferior fija y la hoja, cuya sombra va hacia arriba.

Sin gradientes. Sin bordes decorativos: si algo necesita separarse, primero se
prueba con espacio; el `hairline` es el segundo recurso.

## Movimiento

| Token | Duración | Para qué |
|---|---|---|
| `instant` | 140 ms | Cambios de estado, feedback de pulsación |
| `base` | 200 ms | Transiciones habituales |
| `slow` | 280 ms | Hojas, cambios de contenido de pantalla |
| `slowest` | 380 ms | Solo la confirmación |

Curva `cubic-bezier(0.22, 1, 0.36, 1)`. Los resortes (`snappy` para marcadores y
chips, `gentle` para hojas y mapa) son los únicos dos que existen. Toda
superficie pulsable usa el mismo `PressableScale` a 0.97: esa uniformidad es la
mitad de la sensación de calidad.

## Componentes

`Text` · `Button` (primary / secondary / ghost / accent / danger) · `IconButton`
· `Chip` · `Surface` · `Row` · `Divider` · `Input` · `Skeleton` · `EmptyState` ·
`Rating` · `Badge` · `AvailabilityBadge` · `SegmentedControl` · `Toggle` ·
`Avatar` · `Screen` · `StickyBar`.

Del dominio: `ParkingRow`, `ParkingPreviewCard`, `PhotoGallery`, `FeatureGrid`,
`ReviewRow`, `DateStrip`, `TimeField`, `PriceSummary`, `PaymentMethodPicker`,
`BookingRow`, `EarningsChart`, `PhotoPickerGrid`, `PriceMarker`, `UserDot`.

## El marcador

La decisión de diseño más visible: **el marcador es el precio, no un pin**. El
precio es lo que el conductor compara, así que es lo que el mapa muestra.

- En reposo: píldora blanca, texto tinta, sombra `raised`, muesca inferior.
- Seleccionado: se invierte a tinta sobre blanco, sube 4 px y escala a 1.1 con el
  resorte `snappy` — el mismo movimiento con el que la hoja cambia de contenido.
- Sin cupos: la misma píldora al 55 % de opacidad.
- Los marcadores que chocan se separan verticalmente, priorizando los más
  cercanos al conductor, que conservan su posición real.

## Estados

Cada lista implementa carga (esqueletos con la forma del contenido real), vacío,
error y sin resultados, todos con el mismo `EmptyState` en distintos tonos. Los
botones tienen deshabilitado, cargando y pulsado. La disponibilidad tiene tres
niveles con etiqueta propia.
