# Cómo trabajar en Easy Parking

## Ramas

```
main        estable, siempre desplegable
develop     integración
feature/*   trabajo en curso, sale de develop y vuelve a develop
fix/*       correcciones
```

- No se hace `force push` a `main` ni a `develop`.
- No se borran ramas ajenas.
- Los PR van contra `develop`. `develop → main` cuando la versión está lista.

Nombres: `feature/checkout-pse`, `fix/marcadores-solapados`.

## Commits

Uno por unidad lógica, en imperativo y en español o inglés — pero consistente
dentro de la rama.

```
feat(mapa): separar marcadores que se solapan
fix(reservas): evitar que la fecha larga se trunque en la fila
docs: documentar la ruta hacia Supabase
```

## Antes de abrir un PR

```bash
npm run typecheck
```

Debe salir sin errores. Además, revisa la pantalla que tocaste a **390 px de
ancho**, no en el navegador maximizado:

```bash
npm run web            # en una terminal
node .devtools/serve.js # en otra, y abre http://localhost:8090
```

## Reglas que no se negocian

1. **Nada de valores visuales sueltos.** Ni `#hex`, ni `fontSize: 15`, ni
   `padding: 13`. Todo sale de `src/constants/theme.ts`. Si falta un token, se
   añade ahí primero y se justifica en el PR.
2. **Las pantallas no calculan.** Precio, distancia, disponibilidad y formato
   viven en `src/utils`. Las pantallas componen.
3. **Las pantallas no importan de `mocks/`.** Siempre a través de `services/`.
4. **Accesibilidad de entrada, no al final.** Todo control interactivo lleva
   `accessibilityLabel`, área táctil de 44 pt y un estado que no dependa solo del
   color.
5. **Un componente nuevo se justifica.** Antes de crear uno, revisa
   `src/components/ui`: casi siempre existe y solo hace falta una prop.

## Dónde va cada cosa

| Si estás haciendo… | Va en… |
|---|---|
| Una pantalla o ruta nueva | `app/` |
| Un elemento reutilizable sin dominio | `src/components/ui/` |
| Algo que sabe de parqueaderos o reservas | `src/components/parking`, `/booking`, `/owner` |
| Una consulta de datos | `src/services/` |
| Estado compartido entre pantallas | `src/store/` |
| Un cálculo puro | `src/utils/` |
| Un color, tamaño, radio o duración | `src/constants/theme.ts` |
| Una etiqueta o icono de un enum del dominio | `src/constants/catalog.ts` |

## Alcance actual

Datos mock, sin backend. **No** conectes Supabase, pagos ni mapas reales dentro
de una rama de UI: eso va en su propia rama y en su propio PR, para que la
revisión sea legible.
