import { MapPin } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { palette, radius, shadow } from '@/constants/theme';

/** Alto total del pin, de la cabeza a la punta. */
export const PLACE_PIN_HEIGHT = 42;

const HEAD = 34;
const TIP = PLACE_PIN_HEIGHT - HEAD;

/**
 * Pin de un sitio concreto: el punto que alguien está eligiendo.
 *
 * No es `PriceMarker` porque no hay precio que mostrar todavía —esto se usa en
 * el asistente de publicación, antes del paso de tarifa— y no es `UserDot`
 * porque no marca dónde está el conductor. Es la tercera cosa que un mapa
 * necesita señalar: aquí.
 */
export function PlacePin() {
  return (
    <View style={styles.root} pointerEvents="none">
      <View style={[styles.head, shadow.raised]}>
        <MapPin size={17} color={palette.inkInverse} strokeWidth={2.4} />
      </View>
      <View style={styles.tip} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    height: PLACE_PIN_HEIGHT,
  },
  head: {
    width: HEAD,
    height: HEAD,
    borderRadius: radius.pill,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Triángulo que baja de la cabeza hasta el punto exacto. Se dibuja con
  // bordes porque no hay clip-path en React Native.
  tip: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: TIP,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: palette.ink,
  },
});
