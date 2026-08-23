# Compilar un APK

Para **mirar la app** no hace falta compilar nada: `npm run start:lan` y escanear
el QR con Expo Go muestra todo, mapa real incluido, y recarga al guardar. El APK
sirve para otra cosa: pasarle la app a alguien que no tiene el proyecto, o
probarla sin depender del computador.

---

## Por qué se compila en la nube y no aquí

Compilar Android localmente pide **JDK 17** y el **Android SDK**. En este equipo
hay Java 8 y no hay SDK, así que la ruta local implicaría instalar varios GB de
herramientas. EAS Build lo hace en los servidores de Expo y devuelve un enlace
de descarga.

---

## Los tres pasos

```bash
npx eas-cli login
```

Pide la cuenta de Expo. Si no existe, se crea en <https://expo.dev/signup>.

### Subir las claves — este paso no es opcional

`.env.local` está en `.gitignore`, así que **no viaja al servidor de build**. Si
se compila sin hacer esto, la app instala y abre bien, pero **el mapa sale como
una cuadrícula gris vacía**: Google rechaza la petición por falta de clave y
`react-native-maps` no avisa de nada.

```bash
npx eas-cli secret:create --scope project --name EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID --value LA_CLAVE
npx eas-cli secret:create --scope project --name EXPO_PUBLIC_GOOGLE_MAPS_KEY_IOS     --value LA_CLAVE
```

Las claves están en `.env.local`, y en la
[consola de Google Cloud](https://console.cloud.google.com/apis/credentials?project=project-bb24b33c-cba3-4349-bb5).

Las de Supabase todavía no hacen falta: ninguna pantalla las usa.

### Compilar

```bash
npm run build:apk
```

La primera vez pregunta si crear el proyecto en la cuenta y si generar un
*keystore* de firma — a las dos, que sí. El keystore lo guarda Expo; **no se
pierde y no se sube al repositorio**.

Tarda entre 10 y 20 minutos según la cola del plan gratuito. Al terminar imprime
un enlace de descarga y un QR. Para ver el estado más tarde:

```bash
npm run build:apk:status
```

---

## Qué se va a ver en ese APK

Toda la app, con **datos de mentira**:

- Los 12 parqueaderos de `src/mocks/parkings.ts`, siempre los mismos.
- El mapa **sí es real** — tiles de Google de Bogotá, con nuestro estilo.
- Reservar funciona y la reserva aparece en "Mis reservas", pero **se pierde al
  cerrar la app**: vive en memoria, no en una base de datos.
- El pago es una pantalla, no un cobro.
- No hay login: entra directo como el usuario de `src/mocks/user.ts`.

Es decir: sirve para juzgar diseño, navegación y sensación de uso. No para
probar que los datos persisten, porque todavía no persisten.

---

## Detalles de los perfiles

`eas.json` define tres:

| Perfil | Qué produce | Para qué |
|---|---|---|
| `preview` | **APK**, distribución interna | Enseñar la app. Es el de `npm run build:apk`. |
| `development` | APK con cliente de desarrollo | El día que se use una librería que Expo Go no trae. |
| `production` | **AAB** | Subir a Google Play. Un AAB no se instala en un teléfono. |

Que `preview` genere APK y no AAB es a propósito: el AAB es el formato que pide
Google Play y **no se puede instalar directamente**. Para pasarle la app a
alguien por WhatsApp, tiene que ser APK.

Para instalarlo, el teléfono tiene que permitir **orígenes desconocidos**; el
propio Android lo pregunta al abrir el archivo.
