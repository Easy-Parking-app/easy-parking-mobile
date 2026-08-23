import * as Haptics from 'expo-haptics';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type MapPressEvent } from 'react-native-maps';

import { motion } from '@/constants/theme';
import { hapticsEnabled } from '@/store/useSettingsStore';
import type { LatLng } from '@/types';
import { formatCop } from '@/utils/format';
import { googleMapStyle } from './googleMapStyle';
import { PLACE_PIN_HEIGHT, PlacePin } from './PlacePin';
import { PRICE_MARKER_HEIGHT, PriceMarker } from './PriceMarker';
import type { MapMarker, MapViewProps } from './types';
import { UserDot } from './UserDot';

/**
 * Mapa real, con tiles de Google.
 *
 * Cumple `MapViewProps` igual que `MapCanvas`, asi que las pantallas no saben
 * cual de los dos estan usando. `index.ts` elige: este en movil, el dibujado en
 * web (react-native-maps no soporta web).
 */

/**
 * Zoom inicial. 14 deja ver algo mas de un kilometro de ancho: suficiente para
 * comparar entre manzanas vecinas, que es lo que hace quien busca parqueadero.
 *
 * Va como zoom y no como `latitudeDelta` a proposito. Una region se define por
 * cuantos grados tiene que caber en la pantalla, pero `mapPadding` reserva aqui
 * mas de la mitad del alto —controles arriba, hoja abajo—, asi que el mapa
 * tenia que alejarse muchisimo para meter esos grados en la franja que queda.
 * El resultado era Bogota entera y La Calera al fondo. El zoom no depende del
 * tamano de la franja, asi que no sufre ese efecto.
 */
const INITIAL_ZOOM = 14;

/**
 * Cuanto tiempo se deja al marcador "vivo" tras cambiar de estado.
 *
 * `tracksViewChanges` es la diferencia entre un mapa fluido y uno inservible en
 * Android: mientras esta activo, cada frame del marcador se re-rasteriza y se
 * vuelve a subir al mapa nativo. Con veinte marcadores animando a la vez el
 * rendimiento se desploma.
 *
 * Pero apagarlo del todo congela el marcador en su primer frame y la seleccion
 * no se veria. La solucion es dejarlo encendido solo mientras dura el muelle de
 * `PriceMarker` y apagarlo despues. 450 ms cubre `motion.spring.snappy` con
 * margen.
 */
const TRACK_WINDOW = 450;

/**
 * Margen invisible alrededor del marcador.
 *
 * Android no dibuja la vista del marcador: la rasteriza a un bitmap del tamaño
 * que la vista mide y sube ese bitmap al mapa. La sombra `raised` cae unos
 * 16 px y el seleccionado crece un 10 %, así que sin margen eso se recorta.
 */
const MARKER_BLEED = 16;

const MARKER_TOTAL_HEIGHT = PRICE_MARKER_HEIGHT + MARKER_BLEED * 2;

/**
 * Ancho del contenedor del marcador, calculado del texto.
 *
 * Aquí estaba el recorte de verdad. Un margen no bastaba: dentro de un
 * `<Marker>` de Android la vista se mide con un ancho disponible que no
 * corresponde a su contenido, y la píldora acababa comprimida hasta que el
 * `numberOfLines={1}` del precio lo cortaba con puntos suspensivos —"$ 8.." en
 * vez de "$ 8.000"—. No era el bitmap: era el texto, truncado antes de pintarse.
 *
 * Fijar el ancho quita la ambigüedad. Se estima del número de caracteres y se
 * redondea hacia arriba a propósito: **pasarse es gratis** —el contenedor es
 * transparente y la píldora va centrada, así que el anclaje sigue señalando el
 * mismo punto— mientras que quedarse corto vuelve a cortar el precio.
 */
const CHAR_WIDTH = 9;
/** Padding horizontal de la píldora más su borde. */
const PILL_CHROME = 28;
const MIN_PILL_WIDTH = 62;

const markerWidth = (label: string) =>
  Math.max(MIN_PILL_WIDTH, label.length * CHAR_WIDTH + PILL_CHROME) + MARKER_BLEED * 2;

/**
 * Anclaje del marcador, en fracción de su alto.
 *
 * Lo que señala la ubicación es la punta del pico, no el centro de la píldora.
 * Con el margen añadido, esa punta ya no está abajo del todo, así que el
 * anclaje se calcula en vez de fijarse a 1.
 */
const MARKER_ANCHOR_Y = (MARKER_BLEED + PRICE_MARKER_HEIGHT) / MARKER_TOTAL_HEIGHT;

function selectionHaptic() {
  if (Platform.OS !== 'web' && hapticsEnabled()) {
    void Haptics.selectionAsync();
  }
}

type AnnotationProps = {
  marker: MapMarker;
  selected: boolean;
  onSelect: (id: string) => void;
};

const PriceAnnotation = memo(function PriceAnnotation({
  marker,
  selected,
  onSelect,
}: AnnotationProps) {
  const [tracking, setTracking] = useState(true);

  // Se reactiva en cada cambio de seleccion —y en el montaje— y se apaga sola.
  useEffect(() => {
    setTracking(true);
    const timer = setTimeout(() => setTracking(false), TRACK_WINDOW);
    return () => clearTimeout(timer);
  }, [selected]);

  const handlePress = useCallback(() => {
    selectionHaptic();
    onSelect(marker.id);
  }, [marker.id, onSelect]);

  return (
    <Marker
      coordinate={marker.coordinate}
      onPress={handlePress}
      tracksViewChanges={tracking}
      // La punta del pico marca el sitio, no el centro de la pildora. Con el
      // margen de rasterizacion esa punta ya no queda abajo del todo.
      anchor={{ x: 0.5, y: MARKER_ANCHOR_Y }}
      // El seleccionado crece: si otro marcador lo tapa, deja de leerse.
      zIndex={selected ? 2 : 1}
    >
      {/*
        El toque lo atiende el <Marker>, no el Pressable de dentro: en Android
        los gestos sobre vistas anidadas en un marcador nativo se pierden a
        menudo. `pointerEvents="none"` evita que compitan por el mismo toque.

        El tamano es explicito: ver markerWidth.
      */}
      <View
        pointerEvents="none"
        style={[
          styles.markerBox,
          { width: markerWidth(formatCop(marker.price)), height: MARKER_TOTAL_HEIGHT },
        ]}
      >
        <PriceMarker
          price={marker.price}
          selected={selected}
          unavailable={marker.unavailable}
          onPress={handlePress}
          accessibilityLabel={marker.label}
        />
      </View>
    </Marker>
  );
});

const PIN_TOTAL_HEIGHT = PLACE_PIN_HEIGHT + MARKER_BLEED * 2;
const PIN_ANCHOR_Y = (MARKER_BLEED + PLACE_PIN_HEIGHT) / PIN_TOTAL_HEIGHT;
/** La cabeza del pin mide 34; el resto es margen para la sombra. */
const PIN_WIDTH = 34 + MARKER_BLEED * 2;

/**
 * Pin del sitio elegido.
 *
 * Necesita su propia ventana de seguimiento igual que las píldoras: sin ella,
 * Android puede rasterizarlo antes de que termine el layout y dejarlo a medias.
 * Se reactiva cuando cambia la coordenada, que es cuando se vuelve a montar en
 * otro punto.
 */
const PinAnnotation = memo(function PinAnnotation({ coordinate }: { coordinate: LatLng }) {
  const [tracking, setTracking] = useState(true);

  useEffect(() => {
    setTracking(true);
    const timer = setTimeout(() => setTracking(false), TRACK_WINDOW);
    return () => clearTimeout(timer);
  }, [coordinate.latitude, coordinate.longitude]);

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: PIN_ANCHOR_Y }}
      tracksViewChanges={tracking}
      zIndex={3}
      accessibilityLabel="Ubicación elegida"
    >
      <View
        pointerEvents="none"
        style={[styles.markerBox, { width: PIN_WIDTH, height: PIN_TOTAL_HEIGHT }]}
      >
        <PlacePin />
      </View>
    </Marker>
  );
});

export function MapGoogleView({
  markers,
  selectedId,
  onSelectMarker,
  userLocation,
  focus,
  bottomInset = 0,
  topInset = 0,
  interactive = true,
  onPressCoordinate,
  pin,
  showsUser = true,
  style,
}: MapViewProps) {
  const mapRef = useRef<MapView>(null);

  // Mueve la camara cuando cambia el foco: al elegir un parqueadero o al buscar
  // en otra zona. `focus` nulo significa "quedate donde esta el conductor".
  useEffect(() => {
    const center = focus ?? userLocation;
    mapRef.current?.animateCamera({ center }, { duration: motion.duration.slow });
  }, [focus, userLocation]);

  const handleSelect = useCallback(
    (id: string) => onSelectMarker(id),
    [onSelectMarker],
  );

  // Tocar el mapa deselecciona, igual que en el mapa dibujado, y ademas
  // entrega la coordenada a quien la haya pedido.
  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      if (selectedId != null) onSelectMarker(null);
      onPressCoordinate?.(event.nativeEvent.coordinate);
    },
    [onPressCoordinate, onSelectMarker, selectedId],
  );

  return (
    <MapView
      ref={mapRef}
      style={[StyleSheet.absoluteFill, style]}
      // En Android es el unico proveedor; en iOS fuerza Google en vez de Apple
      // Maps, para que el mapa se vea igual en las dos plataformas.
      provider={PROVIDER_GOOGLE}
      customMapStyle={googleMapStyle}
      initialCamera={{
        center: userLocation,
        zoom: INITIAL_ZOOM,
        pitch: 0,
        heading: 0,
        // Lo usa iOS; Android se queda con `zoom`.
        altitude: 0,
      }}
      // Empuja el centro de la camara fuera de las zonas tapadas por los
      // controles flotantes y por la hoja inferior. Sin esto, el parqueadero
      // recien seleccionado queda centrado justo detras de la hoja.
      mapPadding={{ top: topInset, bottom: bottomInset, left: 0, right: 0 }}
      onPress={handleMapPress}
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      // Rotar e inclinar no aportan nada aqui y descuadran las etiquetas.
      rotateEnabled={false}
      pitchEnabled={false}
      // Dibujamos nuestro propio punto: el azul de Google es de otra marca, y
      // ademas pedirlo activaria el permiso de ubicacion antes de tiempo.
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass={false}
      toolbarEnabled={false}
      showsPointsOfInterest={false}
      showsIndoors={false}
    >
      {showsUser ? (
        <Marker
          coordinate={userLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          // Fijo a proposito. `UserDot` late en bucle, y dejar el seguimiento
          // encendido re-rasterizaria el marcador en cada frame para siempre. Se
          // pierde el pulso y se gana un mapa que no se traba.
          tracksViewChanges={false}
          accessibilityLabel="Tu ubicación"
        >
          <View pointerEvents="none">
            <UserDot />
          </View>
        </Marker>
      ) : null}

      {pin ? <PinAnnotation coordinate={pin} /> : null}

      {markers.map((marker) => (
        <PriceAnnotation
          key={marker.id}
          marker={marker}
          selected={marker.id === selectedId}
          onSelect={handleSelect}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  // Tamaño explícito y contenido centrado: el marcador nunca depende de cómo
  // Android decida medirlo dentro del <Marker>.
  markerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
