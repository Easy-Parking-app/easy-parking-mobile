import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

/**
 * Convierte marcas de React en imágenes, para poder dárselas al mapa.
 *
 * **Por qué hace falta.** Un `<Marker>` con hijos no se dibuja: se rasteriza a
 * un bitmap cuyo tamaño reporta `SizeReportingShadowNode` a través de
 * `createShadowNodeInstance` y `updateExtraData`. Esas dos APIs son de la
 * arquitectura vieja, y react-native-maps 1.20.1 —la que trae Expo Go SDK 54—
 * no soporta la nueva, así que pasa por la capa de interoperabilidad y nunca se
 * llaman. Sin tamaño reportado, `MapMarker.java` cae a un lienzo de 100 píxeles
 * físicos: unos 50 dp en densidad 2, 33 en densidad 3. Un precio no cabe ahí y
 * sale cortado.
 *
 * Pero `getIcon()` tiene otra rama: **sin hijos y con `image`, usa la imagen tal
 * cual, sin lienzo de por medio**. Así que en vez de darle vistas al marcador,
 * le damos una imagen ya hecha.
 *
 * La alternativa era pintar las píldoras en una capa encima del mapa. Se probó
 * y no sirve: la región llega por el hilo de JS, siempre un par de frames tarde,
 * y las marcas se despegan del mapa al mover. Un marcador nativo lo mueve el
 * propio mapa, así que queda clavado.
 *
 * Cada variante se captura una sola vez y se guarda. La clave la decide quien
 * llama, e incluye el estado: un precio seleccionado es otra imagen.
 */

export type MarkerImageRequest = {
  /** Identifica la variante. Mismo contenido, misma clave. */
  key: string;
  render: () => ReactNode;
};

/**
 * Captura un nodo cuando se monta.
 *
 * `collapsable={false}` no es opcional: sin él, Android puede no crear una vista
 * nativa para este contenedor —lo colapsa por ser un envoltorio sin estilo— y
 * entonces no hay nada que capturar.
 */
function Capture({
  id,
  onCaptured,
  children,
}: {
  id: string;
  onCaptured: (key: string, uri: string) => void;
  children: ReactNode;
}) {
  const ref = useRef<View>(null);

  useEffect(() => {
    let alive = true;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout>;

    const capture = async () => {
      try {
        /**
         * A archivo, no a data-uri.
         *
         * El `image` del marcador acepta las dos cosas, pero un data-uri lleva
         * el PNG entero en base64 cruzando el puente y luego Fresco tiene que
         * decodificarlo. Mientras tanto el marcador no tiene icono, y
         * `getIcon()` devuelve el pin rojo por defecto: se ve un pin rojo que
         * al rato se convierte en píldora. Desde archivo la carga es
         * prácticamente inmediata y ese salto no llega a verse.
         */
        const path = await captureRef(ref, { format: 'png', quality: 1 });
        if (!alive) return;
        onCaptured(id, path.startsWith('file://') ? path : `file://${path}`);
      } catch {
        // Un reintento: el primer fallo suele ser layout que aún no ocurrió.
        // Si el segundo también falla, la variante se queda sin imagen y su
        // marcador no se dibuja, que es mejor que dibujarlo roto.
        if (alive && attempt++ < 1) timer = setTimeout(capture, 120);
      }
    };

    // Un turno de espera para que el layout haya ocurrido: capturar antes
    // devuelve una imagen vacía.
    timer = setTimeout(capture, 0);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [id, onCaptured]);

  return (
    <View ref={ref} collapsable={false}>
      {children}
    </View>
  );
}

export function useMarkerImages(requests: MarkerImageRequest[]) {
  const [images, setImages] = useState<Record<string, string>>({});

  const onCaptured = useCallback((key: string, uri: string) => {
    setImages((previous) => (previous[key] ? previous : { ...previous, [key]: uri }));
  }, []);

  const pending = useMemo(
    () => requests.filter((request) => !images[request.key]),
    [images, requests],
  );

  /**
   * Las variantes por capturar, montadas de verdad.
   *
   * Van al fondo del árbol, debajo del mapa, que las tapa por completo. No se
   * pueden esconder con `opacity: 0` ni sacando de pantalla: la captura dibuja
   * la vista, y una vista transparente o recortada se captura en blanco.
   *
   * Cada una se desmonta en cuanto su imagen está lista.
   */
  const factory =
    pending.length > 0 ? (
      <View style={styles.factory} pointerEvents="none">
        {pending.map((request) => (
          <Capture key={request.key} id={request.key} onCaptured={onCaptured}>
            {request.render()}
          </Capture>
        ))}
      </View>
    ) : null;

  return { images, factory };
}

const styles = StyleSheet.create({
  factory: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
});
