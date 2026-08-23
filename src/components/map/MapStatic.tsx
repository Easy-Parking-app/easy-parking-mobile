import { StyleSheet, View, type ViewStyle } from 'react-native';

import { palette, radius } from '@/constants/theme';
import type { LatLng } from '@/types';
import { MapBackdrop } from './MapBackdrop';
import { MapView } from './MapViewImpl';
import { PlacePin } from './PlacePin';

export type MapStaticProps = {
  /**
   * Dónde queda. Con coordenada se dibuja el mapa real; sin ella, la ciudad
   * abstracta de `MapBackdrop` como marcador de posición.
   *
   * Es opcional porque hay sitios —estados de carga, maquetas— donde todavía no
   * hay ubicación, pero pasarla es siempre mejor: enseñar una ciudad inventada
   * al lado de una dirección real es peor que no enseñar mapa.
   */
  coordinate?: LatLng | null;
  height?: number;
  radiusToken?: number;
  style?: ViewStyle;
};

/**
 * Recorte de mapa no interactivo, para fichas de detalle y tarjetas de reserva
 * donde un mapa completo competiría con el contenido.
 */
export function MapStatic({
  coordinate,
  height = 140,
  radiusToken = radius.md,
  style,
}: MapStaticProps) {
  return (
    <View
      style={[styles.root, { height, borderRadius: radiusToken }, style]}
      accessibilityLabel="Mapa de la ubicación"
    >
      {coordinate ? (
        <MapView
          markers={[]}
          selectedId={null}
          onSelectMarker={() => {}}
          userLocation={coordinate}
          focus={coordinate}
          pin={coordinate}
          // Ni punto del conductor ni gestos: esto ilustra, no se explora. Para
          // moverse está el botón de "cómo llegar", que abre la app de mapas.
          showsUser={false}
          interactive={false}
        />
      ) : (
        <>
          <View style={styles.backdrop}>
            <MapBackdrop width={520} height={height * 2} />
          </View>
          <PlacePin />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    backgroundColor: palette.mapLand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
