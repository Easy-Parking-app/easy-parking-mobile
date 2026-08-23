import * as Haptics from 'expo-haptics';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { motion } from '@/constants/theme';
import { hapticsEnabled } from '@/store/useSettingsStore';
import { googleMapStyle } from './googleMapStyle';
import { PriceMarker } from './PriceMarker';
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
      // La punta de la pildora marca el sitio, no su centro.
      anchor={{ x: 0.5, y: 1 }}
      // El seleccionado crece: si otro marcador lo tapa, deja de leerse.
      zIndex={selected ? 2 : 1}
    >
      {/*
        El toque lo atiende el <Marker>, no el Pressable de dentro: en Android
        los gestos sobre vistas anidadas en un marcador nativo se pierden a
        menudo. `pointerEvents="none"` evita que compitan por el mismo toque.
      */}
      <View pointerEvents="none">
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

export function MapGoogleView({
  markers,
  selectedId,
  onSelectMarker,
  userLocation,
  focus,
  bottomInset = 0,
  topInset = 0,
  interactive = true,
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

  // Tocar el mapa deselecciona, igual que en el mapa dibujado.
  const handleMapPress = useCallback(() => {
    if (selectedId != null) onSelectMarker(null);
  }, [onSelectMarker, selectedId]);

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
