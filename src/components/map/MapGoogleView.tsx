import { useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type MapPressEvent } from 'react-native-maps';

import { motion } from '@/constants/theme';
import { googleMapStyle } from './googleMapStyle';
import { PlacePin } from './PlacePin';
import { PriceMarker } from './PriceMarker';
import type { MapViewProps } from './types';
import { useMarkerImages, type MarkerImageRequest } from './useMarkerImages';
import { UserDot } from './UserDot';

/**
 * Mapa real, con tiles de Google.
 *
 * Cumple `MapViewProps` igual que `MapCanvas`, así que las pantallas no saben
 * cuál de los dos están usando. `MapViewImpl` elige: este en móvil, el dibujado
 * en web.
 *
 * Las marcas son `<Marker>` nativos con una imagen, no vistas de React. El
 * porqué —y las dos alternativas que se descartaron— está en
 * `useMarkerImages`. Lo que se gana aquí: las mueve el mapa, así que quedan
 * clavadas a su coordenada sin temblor ni retraso.
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

const priceKey = (price: number, selected: boolean, full: boolean) =>
  `p${price}${selected ? 's' : ''}${full ? 'f' : ''}`;

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

  /**
   * Las variantes que hay que tener como imagen.
   *
   * Se piden los dos estados de cada precio aunque solo uno esté seleccionado:
   * capturar al momento de tocar dejaría un parpadeo justo en la interacción
   * más frecuente de la pantalla.
   */
  const requests = useMemo(() => {
    const list: MarkerImageRequest[] = [];
    const seen = new Set<string>();

    for (const marker of markers) {
      const full = marker.full ?? false;
      for (const selected of [false, true]) {
        const key = priceKey(marker.price, selected, full);
        if (seen.has(key)) continue;
        seen.add(key);
        list.push({
          key,
          render: () => (
            <PriceMarker
              price={marker.price}
              selected={selected}
              full={full}
              onPress={() => {}}
              accessibilityLabel={marker.label}
            />
          ),
        });
      }
    }

    if (showsUser) list.push({ key: 'user', render: () => <UserDot /> });
    if (pin) list.push({ key: 'pin', render: () => <PlacePin /> });

    return list;
  }, [markers, pin, showsUser]);

  const { images, factory } = useMarkerImages(requests);

  // Mueve la cámara cuando cambia el foco: al elegir un parqueadero o al buscar
  // en otra zona. `focus` nulo significa "quédate donde está el conductor".
  useEffect(() => {
    const center = focus ?? userLocation;
    mapRef.current?.animateCamera({ center }, { duration: motion.duration.slow });
  }, [focus, userLocation]);

  const handleMapPress = useCallback(
    (event: MapPressEvent) => {
      if (selectedId != null) onSelectMarker(null);
      onPressCoordinate?.(event.nativeEvent.coordinate);
    },
    [onPressCoordinate, onSelectMarker, selectedId],
  );

  return (
    <View style={[styles.root, style]}>
      {/* Debajo del mapa, que lo tapa. Ver la nota en useMarkerImages. */}
      {factory}

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
        onPress={handleMapPress}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        // Rotar e inclinar no aportan nada aquí y descuadran las etiquetas.
        rotateEnabled={false}
        pitchEnabled={false}
        // Dibujamos nuestro propio punto: el azul de Google es de otra marca.
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        showsPointsOfInterest={false}
        showsIndoors={false}
      >
        {showsUser && images.user ? (
          <Marker
            coordinate={userLocation}
            image={{ uri: images.user }}
            anchor={{ x: 0.5, y: 0.5 }}
            accessibilityLabel="Tu ubicación"
          />
        ) : null}

        {pin && images.pin ? (
          <Marker
            coordinate={pin}
            image={{ uri: images.pin }}
            // La punta del pin, abajo del todo, es lo que señala.
            anchor={{ x: 0.5, y: 1 }}
            zIndex={3}
            accessibilityLabel="Ubicación elegida"
          />
        ) : null}

        {markers.map((marker) => {
          const selected = marker.id === selectedId;
          const key = priceKey(marker.price, selected, marker.full ?? false);
          const uri = images[key];
          // Sin imagen todavía no se dibuja nada: mejor que un marcador a medias.
          if (!uri) return null;

          return (
            <Marker
              /**
               * La imagen forma parte de la identidad, no solo el parqueadero.
               *
               * Cambiar `image` sobre un marcador ya montado no siempre lo
               * refresca: la librería cachea el icono por URI y en `setImage`
               * hay un camino —cuando otro marcador ya empezó a cargar esa
               * misma URI— que sale con `return` sin llamar a `update()`. El
               * marcador se queda con el icono anterior; en la práctica, una
               * píldora que se quedaba negra después de deseleccionarla.
               *
               * Con la imagen en la clave, React monta un marcador nuevo en vez
               * de mutar el existente, y no hay icono viejo que se quede.
               */
              key={`${marker.id}:${key}`}
              coordinate={marker.coordinate}
              image={{ uri }}
              // La punta del pico marca el sitio, no el centro de la píldora.
              anchor={{ x: 0.5, y: 1 }}
              onPress={() => onSelectMarker(marker.id)}
              // El seleccionado va encima: si otro lo tapa, deja de leerse.
              zIndex={selected ? 2 : 1}
              accessibilityLabel={marker.label}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
});
