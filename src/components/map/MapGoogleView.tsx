import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
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
import type { MapMarker, MapViewProps } from './types';
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
 * **Por qué las marcas no son `<Marker>`.**
 *
 * Lo natural sería colgar cada píldora de un `<Marker>` y dejar que el mapa
 * nativo la mantenga pegada a su coordenada. No se puede con la versión de
 * react-native-maps que trae Expo Go SDK 54, y conviene dejarlo escrito para
 * que nadie lo intente otra vez.
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
 * Y ese 100 es en **píxeles físicos**: unos 50 dp en densidad 2, 33 en
 * densidad 3. Un precio no cabe ahí. No era cuestión de apretar el diseño: el
 * techo está por debajo de lo que el contenido necesita.
 *
 * La 1.21.0 en adelante sí trae `codegenConfig`. El día que el proyecto use
 * compilación propia en vez de Expo Go, se puede actualizar y volver a
 * `<Marker>`.
 */

/**
 * Zoom inicial. 14 deja ver algo más de un kilómetro de ancho: suficiente para
 * comparar entre manzanas vecinas, que es lo que hace quien busca parqueadero.
 *
 * Va como zoom y no como región a propósito. Una región se define por cuántos
 * grados deben caber en pantalla, pero `mapPadding` reserva aquí más de la
 * mitad del alto, así que el mapa se alejaba muchísimo para meter esos grados
 * en la franja que quedaba: salía Bogotá entera.
 */
const INITIAL_ZOOM = 14;

/** Margen fuera de pantalla antes de ocultar una marca. */
const CULL_MARGIN = 80;

/* --------------------------------------------------------------- proyección */

/**
 * Latitud proyectada en Mercator.
 *
 * Google Maps usa Web Mercator, donde la latitud no es lineal. A escala de
 * ciudad la diferencia con una proyección lineal es de milésimas de píxel, pero
 * cuesta una línea hacerlo bien y así no aparece deriva al alejar el zoom.
 *
 * Es un worklet: corre en el hilo de UI, dentro del estilo animado.
 */
function mercator(latitude: number) {
  'worklet';
  return Math.log(Math.tan(Math.PI / 4 + (latitude * Math.PI) / 360));
}

/**
 * La región visible, en valores compartidos.
 *
 * Compartidos y no estado de React: es la diferencia entre que las marcas sigan
 * al dedo y que vayan un paso por detrás. `onRegionChange` se dispara en cada
 * frame del gesto; si cada uno provocara un render, React tendría que reconciliar
 * doce vistas por frame y la capa se quedaría atrás del mapa —que se mueve en el
 * hilo nativo—. Escribiendo en valores compartidos, el gesto no toca React: cada
 * marca recalcula su posición en el hilo de UI.
 */
type Viewport = {
  latitude: SharedValue<number>;
  longitude: SharedValue<number>;
  latitudeDelta: SharedValue<number>;
  longitudeDelta: SharedValue<number>;
  width: SharedValue<number>;
  height: SharedValue<number>;
};

type MarkProps = {
  viewport: Viewport;
  coordinate: LatLng;
  /** Desplazamiento desde el punto hasta la esquina superior izquierda. */
  offsetX: number;
  offsetY: number;
  /**
   * El mismo `mapPadding` que recibe el mapa.
   *
   * Hace falta porque la región que llega por `onRegionChange` no es la de toda
   * la vista sino **la de dentro del padding**: `RegionChangeEvent` la saca de
   * `getProjection().getVisibleRegion()`, y Google Maps documenta que esa región
   * excluye el padding.
   *
   * Sin descontarlo, la franja central se estira sobre la pantalla entera. El
   * error no es constante: crece y encoge con el zoom, así que las marcas se
   * desplazan al acercar y alejar.
   */
  topInset: number;
  bottomInset: number;
  children: React.ReactNode;
  pointerEvents?: 'none' | 'box-none';
};

/** Una marca anclada a una coordenada. Se posiciona en el hilo de UI. */
const Mark = memo(function Mark({
  viewport,
  coordinate,
  offsetX,
  offsetY,
  topInset,
  bottomInset,
  children,
  pointerEvents = 'none',
}: MarkProps) {
  const style = useAnimatedStyle(() => {
    const { longitudeDelta, latitudeDelta, width, height } = viewport;

    if (longitudeDelta.value === 0 || width.value === 0) {
      return { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }] };
    }

    const west = viewport.longitude.value - longitudeDelta.value / 2;
    const north = viewport.latitude.value + latitudeDelta.value / 2;
    const south = viewport.latitude.value - latitudeDelta.value / 2;

    const top = mercator(north);
    const span = top - mercator(south);

    // La región cubre solo la franja que deja el padding, no la vista entera.
    const bandTop = topInset;
    const bandHeight = Math.max(1, height.value - topInset - bottomInset);

    const x = ((coordinate.longitude - west) / longitudeDelta.value) * width.value;
    const y =
      span === 0
        ? 0
        : bandTop + ((top - mercator(coordinate.latitude)) / span) * bandHeight;

    // Fuera de pantalla no se oculta la vista, solo se apaga: montarla y
    // desmontarla en cada paneo costaría más que dejarla quieta.
    const visible =
      x > -CULL_MARGIN &&
      x < width.value + CULL_MARGIN &&
      y > -CULL_MARGIN &&
      y < height.value + CULL_MARGIN;

    return {
      opacity: visible ? 1 : 0,
      // Transform y no `left`/`top`: mover con transform no dispara layout, que
      // es justo lo que no puede pasar sesenta veces por segundo.
      transform: [{ translateX: x + offsetX }, { translateY: y + offsetY }],
    };
  });

  return (
    <Animated.View style={[styles.mark, style]} pointerEvents={pointerEvents}>
      {children}
    </Animated.View>
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

  const latitude = useSharedValue(userLocation.latitude);
  const longitude = useSharedValue(userLocation.longitude);
  const latitudeDelta = useSharedValue(0);
  const longitudeDelta = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  /**
   * Agrupados una sola vez.
   *
   * Los valores compartidos son estables, pero el objeto que los envuelve no lo
   * sería si se creara en cada render: `Mark` está memoizado y recibiría una
   * referencia nueva cada vez, así que el `memo` no serviría de nada.
   */
  const viewport: Viewport = useMemo(
    () => ({ latitude, longitude, latitudeDelta, longitudeDelta, width, height }),
    [height, latitude, latitudeDelta, longitude, longitudeDelta, width],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      width.value = event.nativeEvent.layout.width;
      height.value = event.nativeEvent.layout.height;
    },
    [height, width],
  );

  const onRegionChange = useCallback(
    (region: Region) => {
      latitude.value = region.latitude;
      longitude.value = region.longitude;
      latitudeDelta.value = region.latitudeDelta;
      longitudeDelta.value = region.longitudeDelta;
    },
    [latitude, latitudeDelta, longitude, longitudeDelta],
  );

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

  return (
    <View style={[styles.root, style]} onLayout={onLayout}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        // En Android es el único proveedor; en iOS fuerza Google en vez de
        // Apple Maps, para que se vea igual en las dos plataformas.
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
        // En Android esto se dispara durante el gesto, no solo al soltar, que
        // es lo que permite que la capa siga al dedo.
        onRegionChange={onRegionChange}
        onRegionChangeComplete={onRegionChange}
        onPress={handleMapPress}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        // Rotar e inclinar romperían la proyección: supone el norte arriba y la
        // cámara en cenital. Tampoco aportan nada aquí.
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

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {showsUser ? (
          <Mark
            viewport={viewport}
            coordinate={userLocation}
            offsetX={-22}
            offsetY={-22}
            topInset={topInset}
            bottomInset={bottomInset}
          >
            <UserDot />
          </Mark>
        ) : null}

        {pin ? (
          // La punta del pin señala: el alto cuelga hacia arriba desde el punto.
          <Mark
            viewport={viewport}
            coordinate={pin}
            offsetX={-17}
            offsetY={-PLACE_PIN_HEIGHT}
            topInset={topInset}
            bottomInset={bottomInset}
          >
            <PlacePin />
          </Mark>
        ) : null}

        {markers.map((marker: MapMarker) => (
          <Mark
            key={marker.id}
            viewport={viewport}
            coordinate={marker.coordinate}
            offsetX={-priceMarkerWidth(marker.price) / 2}
            offsetY={-PRICE_MARKER_HEIGHT}
            topInset={topInset}
            bottomInset={bottomInset}
            pointerEvents="box-none"
          >
            <PriceMarker
              price={marker.price}
              selected={marker.id === selectedId}
              unavailable={marker.unavailable}
              onPress={() => onSelectMarker(marker.id)}
              accessibilityLabel={marker.label}
            />
          </Mark>
        ))}
      </View>
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
    top: 0,
    left: 0,
  },
});
