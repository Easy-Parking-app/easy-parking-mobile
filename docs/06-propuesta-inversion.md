# Propuesta para inversores

**Estado:** guardada como borrador en Angel Investment Network, propuesta
`1641734`. **No está publicada** y no se ha contratado ningún paquete.

> **Regla que gobierna este documento:** aquí no va un solo dato inventado. Lo
> que no sabemos aparece marcado como `[PENDIENTE]` con la fuente de donde debe
> salir. Un número inflado en una propuesta a inversores no es una licencia
> creativa: es lo que hace que la primera llamada de diligencia sea la última.

---

## Lo ya rellenado en el formulario

| Campo | Valor | Por qué |
|---|---|---|
| Título | Easy Parking | Límite de 25 caracteres |
| Nombre de la compañía | Easy Parking | Cambiar si la razón social es otra |
| Ubicación | Andes | La región donde el formulario mete a Bogotá |
| Sector 1 | Transporte → Transporte | |
| Sector 2 | Software | Amplía el alcance a inversores de tecnología |
| Fase | **Pre-lanzamiento/R&D** | Es la respuesta veraz: no hay backend conectado ni usuarios |
| Teléfono | El de tu cuenta | Ya venía rellenado |
| Tipo de inversor | Monthly | Con producto sin lanzar, un ángel implicado vale más que uno silencioso |
| A recaudar | **USD 50.000** | Decisión tuya. La cuenta de abajo cierra en 30.000 |
| Ya recaudado | 0 | |
| Mínimo por inversor | **USD 5.000** | Hasta diez ángeles, sin volver la tabla de socios un caos |
| Participación ofrecida | **15%** | Pre-money de USD 283.000 |
| Logo | `assets/icon.png` | Cargado |

Escritas también: resumen, negocio, mercado, progreso, objetivos, cinco puntos
clave, el acuerdo y el equipo.

### Lo que queda pendiente en la web

- **Imágenes.** Es lo que más falta. Manda tres o cuatro capturas de la app en
  el teléfono —el mapa con las píldoras, el detalle de un parqueadero, el
  checkout— y las subo. Una propuesta con capturas de un producto que existe
  pesa mucho más que una sin ellas.
- **Mercado y competencia**, marcados como pendientes dentro del propio
  formulario para que no se publiquen vacíos por accidente.
- **Tu formación y experiencia**, en la sección de Equipo.
- **Paquetes** y **Publicar**: no los toco. El pago lo decides y lo haces tú.

---

## Resumen (el párrafo que más se lee)

> En Bogotá, encontrar dónde parquear es un problema diario que se resuelve
> dando vueltas a la manzana. Al mismo tiempo, miles de garajes, lotes y
> parqueaderos privados pasan el día vacíos porque no tienen forma de venderle
> ese espacio a un desconocido.
>
> Easy Parking conecta las dos puntas: el conductor ve en el mapa qué hay cerca,
> a qué precio y con cuántos cupos, y reserva antes de salir. El propietario
> publica su espacio en ocho pasos y cobra por horas que hoy no le producen
> nada.
>
> Cobramos una comisión sobre cada reserva. No compramos ni operamos
> parqueaderos: el inventario ya existe, lo que falta es la forma de venderlo.

## El problema

Dos problemas que son el mismo:

- **El conductor** no sabe si hay cupo hasta que llega. Da vueltas, compara
  precios de memoria, y termina en el primero que encuentra.
- **El propietario** de un garaje, un lote o un parqueadero pequeño tiene
  espacio ocioso y ninguna manera de ofrecerlo más allá de un letrero en la
  reja.

## La solución

Un marketplace de dos lados, en móvil:

- **Mapa con precios visibles.** No un pin genérico: el precio por hora se lee
  directamente sobre el mapa, para poder comparar sin abrir nada.
- **Reserva antes de salir**, con la tarifa congelada en el momento de reservar.
- **Publicación guiada en ocho pasos** para el propietario, con un solo tipo de
  decisión por pantalla.
- **Métodos de pago colombianos** en el modelo: Nequi, Daviplata, PSE y tarjeta.

## Modelo de negocio

Comisión sobre cada reserva. Está implementada en el código de precios:

- **10 % sobre el subtotal**, con un piso de 900 COP por transacción.
- La tarifa la pone el propietario; el tope por tarifa diaria y los tramos de
  30 minutos con mínimo de una hora ya están en la lógica.

No hay inventario propio, no hay operación física, no hay CAPEX por parqueadero.

## Estado real del producto

Esto es lo que hay hoy, sin adornos:

**Construido y funcionando**
- App móvil para iOS y Android (React Native + Expo), 20 pantallas.
- Flujo completo del conductor: mapa, búsqueda, filtros, detalle, reserva,
  checkout, confirmación, mis reservas, favoritos, perfil.
- Flujo completo del propietario: ingresos, gestión de reservas, publicación.
- Mapa real de Google con estilo propio.
- Base de datos diseñada en Supabase: 9 tablas, seguridad por fila, reserva
  atómica —dos personas no pueden llevarse el mismo cupo— y búsqueda por
  cercanía con índice espacial.

**No construido todavía**
- Autenticación: no existen pantallas de registro ni inicio de sesión.
- La app aún lee datos de ejemplo; la base está vacía.
- Pagos reales: la pasarela no está integrada.
- Cero usuarios, cero reservas, cero ingresos.

## Mercado

`[PENDIENTE]` — **No inventar.** Lo que un inversor va a pedir, y de dónde puede
salir:

- Parque automotor de Bogotá → **RUNT** (runt.gov.co) y Secretaría Distrital de
  Movilidad, cifras oficiales y citables.
- Número de parqueaderos registrados en Bogotá → Secretaría de Movilidad.
- Tarifa promedio por hora → observación propia; se puede levantar en una tarde
  visitando veinte parqueaderos.
- Tamaño del mercado = cupos × ocupación × tarifa. Constrúyelo de abajo hacia
  arriba con esas tres cifras y muestra la cuenta. Un TAM sacado de un informe
  global vale menos que una estimación propia bien argumentada.

## Competencia

`[PENDIENTE]` — Revisar qué existe hoy en Bogotá y ser honesto sobre ello. Un
"no tenemos competencia" es la respuesta que más rápido cierra una conversación:
lo que un inversor oye es que no miraste.

## Uso de los fondos

`[PENDIENTE]` — Depende de cuánto levantes. La estructura que tiene sentido dado
el estado real:

1. Terminar el producto: autenticación, backend conectado, pasarela de pagos.
2. Conseguir la oferta inicial: los primeros propietarios de Bogotá. Esto es
   trabajo de calle, y es lo que decide si el marketplace arranca.
3. Operación y legal: constitución si no existe, contratos con propietarios.

## Equipo

Fundador único. Toda la aplicación —los dos flujos, la interfaz, el mapa y la
base de datos— está construida por una sola persona.

Eso se cuenta como lo que es, sin disimularlo. Un fundador solo es más difícil
de financiar, pero la contrapartida es real y verificable: **el riesgo de
ejecución técnica es bajo**, porque lo que se promete no está en una
presentación, está construido y se puede probar.

Falta añadir tu formación y tu experiencia previa. Eso solo lo puedes escribir tú.

---

## Constituir la SAS: el paso que no se puede saltar

Nadie puede invertir en una persona natural. Antes de que la propuesta pueda
terminar en dinero, tiene que existir la sociedad.

En Colombia la **SAS unipersonal** es legal: puedes ser accionista único y
representante legal a la vez. El registro arranca desde ~$500.000 COP, y el
impuesto de registro es un 0,6–0,7% del capital declarado, así que declarar un
capital bajo lo mantiene barato. Se hace en la Cámara de Comercio y luego el RUT
en la DIAN.

## Y una recomendación sobre el momento

La propuesta se puede dejar lista hoy, y conviene: escribirla obliga a afilar la
historia. Pero **pagar los $129/mes hoy es apostar a que un ángel invierta en un
prototipo sin usuarios**, y ese no suele ser el resultado.

Lo que cambia la conversación, y no es mucho trabajo desde donde estamos:

| Paso | Qué desbloquea |
|---|---|
| Autenticación + backend conectado | Deja de ser una maqueta |
| 5–10 parqueaderos reales publicados por sus dueños | Prueba que el lado difícil del marketplace es alcanzable |
| Las primeras 20–50 reservas | Prueba que hay demanda |

Con eso, la Fase pasa de "Pre-lanzamiento" a "Vendiendo", y la misma propuesta
—con las mismas palabras— vale otra cosa.
