import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  type MapPressEvent,
  type Region,
} from 'react-native-maps';

import { motion } from '@/constants/theme';
import type { LatLng } from '@/types';
import { googleMapStyle } from './googleMapStyle';
import { PLACE_PIN_HEIGHT, PlacePin } from './PlacePin';
import { PRICE_MARKER_HEIGHT, PriceMarker, priceMarkerWidth } from './PriceMarker';
import type { MapViewProps } from './types';
import { UserDot } from './UserDot';

/**
 * Mapa real, con tiles de Google.
 *
 * Cumple `MapViewProps` igual que `MapCanvas`, así que las pantallas no saben
 * cuál de los dos están usando. `MapViewImpl` elige: este en móvil, el dibujado
 * en web.
 *
 * ---
 *
 * **Por qué los marcadores no son `<Marker>`.**
 *
 * Lo natural sería colgar cada píldora de un `<Marker>` y dejar que el mapa
 * nativo la mantenga pegada a su coordenada. No se puede con la versión de
 * react-native-maps que trae Expo Go SDK 54, y conviene dejar escrito por qué
 * para que nadie lo intente otra vez.
 *
 * Un `<Marker>` con hijos no se dibuja: se rasteriza a un bitmap. En
 * `MapMarker.java`:
 *
 *     int width  = this.width  <= 0 ? 100 : this.width;
 *     int height = this.height <= 0 ? 100 : this.height;
 *
 * Quien rellena `this.width` es `SizeReportingShadowNode`, vía
 * `createShadowNodeInstance` y `updateExtraData`: dos APIs de la arquitectura
 * vieja. react-native-maps 1.20.1 no declara `codegenConfig` —no soporta la
 * nueva arquitectura— así que pasa por la capa de interoperabilidad, que no
 * llama a ninguna de las dos. El tamaño nunca se reporta y el fallback se
 * aplica siempre.
 *
 * Y ese 100 es en **píxeles físicos**: unos 50 dp en una pantalla de densidad 2
 * y 33 en una de densidad 3. Un precio no cabe ahí. No es cuestión de apretar
 * el diseño; el techo está por debajo de lo que el contenido necesita.
 *
 * La 1.21.0 en adelante sí trae `codegenConfig`. El día que el proyecto use una
 * compilación propia en vez de Expo Go, se puede actualizar y volver a
 * `<Marker>`. Mientras tanto, las marcas van en una capa encima del mapa y las
 * posicionamos nosotros.
 *
 * A cambio de la complejidad de proyectar, se gana: sin rasterización no hay
 * recortes, no hace falta `tracksViewChanges` —que era el compromiso entre
 * fluidez y que la selección se viera— y las animaciones animan de verdad en
 * lugar de quedarse congeladas en una captura.
 */

/**
 * Zoom inicial. 14 deja ver algo más de un kilómetro de ancho: suficiente para
 * comparar entre manzanas vecinas, que es lo que hace quien busca parqueadero.
 *
 * Va como zoom y no como región a propósito. Una región se define por cuántos
 * grados deben caber en pantalla, pero `mapPadding` reserva aquí más de la
 * mitad del alto —controles arriba, hoja abajo—, así que el mapa se alejaba
 * muchísimo para meter esos grados en la franja que quedaba: salía Bogotá
 * entera. El zoom no depende del tamaño de la franja.
 */
const INITIAL_ZOOM = 14;

/** Margen fuera de pantalla antes de dejar de dibujar una marca. */
const CULL_MARGIN = 80;

/* --------------------------------------------------------------- proyección */

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * Latitud proyectada en Mercator.
 *
 * Google Maps usa Web Mercator, donde la latitud no es lineal: un grado cerca
 * del ecuador ocupa menos alto que uno cerca del polo. A la escala de una
 * ciudad la diferencia con una proyección lineal es de pocos píxeles, pero
 * cuesta una línea hacerlo bien y así las píldoras no derivan al alejar el zoom.
 */
const mercator = (latitude: number) =>
  Math.log(Math.tan(Math.PI / 4 + toRadians(latitude) / 2));

/** Coordenada a punto de pantalla, dentro de la región visible. */
function project(
  coordinate: LatLng,
  region: Region,
  size: { width: number; height: number },
) {
  const west = region.longitude - region.longitudeDelta / 2;
  const north = region.latitude + region.latitudeDelta / 2;
  const south = region.latitude - region.latitudeDelta / 2;

  const top = mercator(north);
  const span = top - mercator(south);

  return {
    x: ((coordinate.longitude - west) / region.longitudeDelta) * size.width,
    y: span === 0 ? 0 : ((top - mercator(coordinate.latitude)) / span) * size.height,
  };
}

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
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [region, setRegion] = useState<Region | null>(null);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  }, []);

  // Mueve la cámara cuando cambia el foco: al elegir un parqueadero o al buscar
  // en otra zona. `focus` nulo significa "quédate donde está el conductor".
  useEffect(() => {
    const center = focus ?? userLocation;
    mapRef.current?.animateCamera({ center }, { duration: motion.duration.slow });
  }, [focus, userLocation]);

  // Tocar el mapa deselecciona, y además entrega la coordenada a quien la haya
  // pedido. La capa de marcas no lo intercepta: es `box-none`.
  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      if (selectedId != null) onSelectMarker(null);
      onPressCoordinate?.(event.nativeEvent.coordinate);
    },
    [onPressCoordinate, onSelectMarker, selectedId],
  );

  const ready = region != null && size.width > 0;

  /**
   * Marcas visibles, ya posicionadas.
   *
   * Se descartan las que caen fuera de pantalla: en una ciudad la mayoría de
   * los parqueaderos están fuera del encuadre casi siempre, y no tiene sentido
   * montar vistas para ellos.
   */
  const placed = useMemo(() => {
    if (!ready) return [];
    return markers
      .map((marker) => ({ marker, point: project(marker.coordinate, region, size) }))
      .filter(
        ({ point }) =>
          point.x > -CULL_MARGIN &&
          point.x < size.width + CULL_MARGIN &&
          point.y > -CULL_MARGIN &&
          point.y < size.height + CULL_MARGIN,
      );
  }, [markers, ready, region, size]);

  const userPoint = ready ? project(userLocation, region, size) : null;
  const pinPoint = ready && pin ? project(pin, region, size) : null;

  return (
    <View style={[styles.root, style]} onLayout={onLayout}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        // En Android es el único proveedor; en iOS fuerza Google en vez de
        // Apple Maps, para que el mapa se vea igual en las dos plataformas.
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
        // Empuja el centro de la cámara fuera de las zonas tapadas por los
        // controles flotantes y por la hoja inferior.
        mapPadding={{ top: topInset, bottom: bottomInset, left: 0, right: 0 }}
        // La región es lo que mantiene las marcas pegadas al mapa. En Android
        // esto se dispara durante el gesto, no solo al soltar, así que la capa
        // sigue al dedo.
        onRegionChange={setRegion}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        // Rotar e inclinar no aportan nada aquí, y además romperían la
        // proyección: esta supone el norte arriba y la cámara en cenital.
        rotateEnabled={false}
        pitchEnabled={false}
        // Dibujamos nuestro propio punto: el azul de Google es de otra marca.
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        showsPointsOfInterest={false}
        showsIndoors={false}
      />

      {ready ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {showsUser && userPoint ? (
            <View
              style={[styles.mark, { left: userPoint.x - 22, top: userPoint.y - 22 }]}
              pointerEvents="none"
            >
              <UserDot />
            </View>
          ) : null}

          {pinPoint ? (
            <View
              style={[
                styles.mark,
                // La punta del pin señala; el alto cuelga hacia arriba.
                { left: pinPoint.x - 17, top: pinPoint.y - PLACE_PIN_HEIGHT },
              ]}
              pointerEvents="none"
            >
              <PlacePin />
            </View>
          ) : null}

          {placed.map(({ marker, point }) => {
            const selected = marker.id === selectedId;
            const width = priceMarkerWidth(marker.price);
            return (
              <View
                key={marker.id}
                style={[
                  styles.mark,
                  {
                    left: point.x - width / 2,
                    top: point.y - PRICE_MARKER_HEIGHT,
                    // El seleccionado va encima: si otro lo tapa, deja de leerse.
                    zIndex: selected ? 2 : 1,
                  },
                ]}
                pointerEvents="box-none"
              >
                <PriceMarker
                  price={marker.price}
                  selected={selected}
                  unavailable={marker.unavailable}
                  onPress={() => onSelectMarker(marker.id)}
                  accessibilityLabel={marker.label}
                />
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  mark: {
    position: 'absolute',
  },
});
