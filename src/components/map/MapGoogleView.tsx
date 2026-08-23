import * as Haptics from 'expo-haptics';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type MapPressEvent } from 'react-native-maps';

import { motion } from '@/constants/theme';
import { hapticsEnabled } from '@/store/useSettingsStore';
import type { LatLng } from '@/types';
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
 * Alto visible del mapa, en grados de latitud. ~5 km.
 *
 * Mas cerrado que el mapa dibujado, que abre a unos 10 km. Con tiles reales esa
 * amplitud deja de ayudar: aparecen calles y etiquetas de media ciudad y los
 * marcadores de precio se pierden entre el ruido. A 5 km todavia se compara
 * entre barrios vecinos, que es lo que hace el conductor.
 */
const LATITUDE_DELTA = 0.045;

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
 * que la vista mide y sube ese bitmap al mapa. Todo lo que se salga de esa
 * medida se recorta — y aquí se sale bastante: la sombra `raised` cae unos
 * 16 px, y el seleccionado crece un 10 % y sube 4 px.
 *
 * Sin este margen las píldoras salen cortadas. Con él, la vista mide de más y
 * el bitmap tiene sitio para todo. No se ve porque es transparente.
 */
const MARKER_BLEED = 16;

const MARKER_TOTAL_HEIGHT = PRICE_MARKER_HEIGHT + MARKER_BLEED * 2;

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

        El padding es el margen que necesita la rasterizacion: ver MARKER_BLEED.
      */}
      <View pointerEvents="none" style={styles.markerBleed}>
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
      <View pointerEvents="none" style={styles.markerBleed}>
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
      initialRegion={{
        ...userLocation,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LATITUDE_DELTA * 0.6,
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
  markerBleed: {
    padding: MARKER_BLEED,
  },
});
