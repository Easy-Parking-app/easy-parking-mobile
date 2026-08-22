# Easy Parking — Definición de producto

> Fuente: análisis del prototipo web hecho en v0 (proyecto interno "PARKLY",
> https://aplicacion-parkly.v0.build). **v0 responde "qué producto construimos", no "cómo se ve la app".**
> Nada de v0 se copia: ni layouts, ni componentes, ni paleta.

## 1. Qué es

Marketplace de parqueaderos para Colombia (arranque en Bogotá). Conecta a
**conductores** que necesitan un lugar seguro para dejar el carro con **propietarios**
de espacios (garajes privados, edificios, lotes, centros comerciales).

## 2. Qué aprendimos del prototipo v0

Pantallas que existían en el prototipo (`components/parkly/`):

| Archivo v0 | Rol en el producto |
|---|---|
| `landing-page.tsx` | Marketing web — **no aplica** en móvil (la app abre en el mapa) |
| `login-view.tsx` / `register-view.tsx` | Autenticación |
| `search-view.tsx` | Búsqueda y listado de parqueaderos |
| `parking-card.tsx` / `parking-detail.tsx` | Tarjeta y detalle del parqueadero |
| `payment-view.tsx` | Checkout |
| `verification-view.tsx` | **Verificación de llegada con 3 fotos** (entrada, vehículo, placa) |
| `owner-onboarding.tsx` / `publish-view.tsx` | Alta de propietario y publicación |
| `owner-dashboard.tsx` | Gestión del propietario |
| `admin-dashboard.tsx` | Backoffice — **fuera de alcance** de la app móvil |
| `navbar.tsx` | Navegación web — se reemplaza por tab bar |

Propuestas de valor que el prototipo comunica y que conservamos:

- Parqueaderos **verificados** por la plataforma.
- **Disponibilidad en tiempo real** y reserva en segundos.
- Pagos locales: **PSE, Nequi, Daviplata y tarjeta**.
- **Verificación de llegada con fotos** (protege al conductor y al propietario).
- **Carga eléctrica** como característica destacada.
- **Calificaciones reales** de otros conductores.

## 3. Qué cambiamos al pasar a móvil

| v0 (web) | Easy Parking (móvil) | Por qué |
|---|---|---|
| Landing con hero, stats y features | La app abre directo en el **mapa** con ubicación | En móvil el usuario ya decidió; el marketing vive en la web |
| Navegación por navbar y vistas completas | **Tab bar** de 4 destinos + stacks | Convención móvil, alcance del pulgar |
| Listado en grilla de tarjetas | **Mapa protagonista + bottom sheet** | El contexto espacial es el valor real |
| Formularios largos de publicación | **Flujo por pasos**, una decisión por pantalla | Revelación progresiva |
| Dashboard de propietario tipo web | **Vista serena**: ingresos, próximas reservas, mis espacios | Un dashboard comprimido se siente ajeno |
| Azul saturado + superficies oscuras genéricas | Identidad propia (ver `02-design-system.md`) | La app no debe parecer una web dentro de un teléfono |
| Admin dashboard | Fuera de alcance (será web) | No es una tarea móvil |

## 4. Alcance de esta fase

- **Conductor:** explorar mapa → buscar → filtrar → detalle → reservar → checkout →
  confirmación → mis reservas → favoritos → perfil.
- **Propietario:** inicio con ingresos → publicar parqueadero (9 pasos) → gestionar
  reservas → ver calificaciones.
- **Datos mock**, sin backend. Capa de servicios asíncrona lista para Supabase.

## 5. Fuera de alcance por ahora

Supabase, autenticación real, pagos reales, mapas reales (se usa una abstracción),
notificaciones push, backoffice de administración.
