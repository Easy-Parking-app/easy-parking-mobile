import { MapPin } from 'lucide-react-native';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { palette, radius, shadow } from '@/constants/theme';
import { MapBackdrop } from './MapBackdrop';

export type MapStaticProps = {
  height?: number;
  radiusToken?: number;
  style?: ViewStyle;
};

/**
 * Non-interactive map snippet for detail screens and reservation cards, where a
 * full map would compete with the content.
 */
export function MapStatic({ height = 140, radiusToken = radius.md, style }: MapStaticProps) {
  return (
    <View
      style={[styles.root, { height, borderRadius: radiusToken }, style]}
      accessibilityLabel="Mapa de la ubicación"
    >
      <View style={styles.backdrop}>
        <MapBackdrop width={520} height={height * 2} />
      </View>
      <View style={[styles.pin, shadow.raised]}>
        <MapPin size={16} color={palette.inkInverse} strokeWidth={2.5} />
      </View>
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
  pin: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
