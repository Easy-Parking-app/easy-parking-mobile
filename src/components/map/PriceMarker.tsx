import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { motion, palette, radius, shadow, space } from '@/constants/theme';
import { formatCop } from '@/utils/format';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';

/** Alto de la píldora. */
const PILL_HEIGHT = 30;
/** Lado del pico, que va girado 45°. */
const NOTCH_SIZE = 8;
/** Cuánto se solapa el pico con la píldora, para que no se vea la costura. */
const NOTCH_OVERLAP = 4;

/**
 * Alto total del marcador: del borde superior de la píldora a la punta del
 * pico, que es el punto que señala la ubicación.
 *
 * Se exporta porque `MapGoogleView` lo necesita para calcular el anclaje del
 * `<Marker>` nativo. Dejarlo como número suelto allá significaría que cambiar
 * la píldora aquí descuadra el marcador allá sin que nada avise.
 */
export const PRICE_MARKER_HEIGHT = PILL_HEIGHT + NOTCH_SIZE - NOTCH_OVERLAP;

export type PriceMarkerProps = {
  price: number;
  selected: boolean;
  /** Dimmed when the parking has no spots left. */
  unavailable?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
};

/**
 * Easy Parking's marker: a price pill, not a pin. Price is the thing drivers
 * compare, so it is the thing the map shows. Selection inverts the pill and
 * springs it up — the same motion the sheet uses to change content.
 */
export const PriceMarker = memo(function PriceMarker({
  price,
  selected,
  unavailable = false,
  onPress,
  accessibilityLabel,
}: PriceMarkerProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, motion.spring.snappy);
  }, [selected, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 + 0.1 * progress.value },
      { translateY: -4 * progress.value },
    ],
  }));

  /**
   * Tres estados, tres tratamientos.
   *
   * "Sin cupos" se resolvía antes bajando la opacidad de todo el marcador. Sobre
   * un mapa con color eso no se lee como apagado sino como sucio: el gris del
   * mapa se mezcla con el blanco de la píldora. Apagarlo con color propio
   * —relleno gris, texto terciario, sin sombra— mantiene el borde nítido y dice
   * lo mismo con más claridad.
   */
  const muted = unavailable && !selected;
  const background = selected ? palette.ink : muted ? palette.surfaceAlt : palette.bg;
  const foreground = selected ? palette.inkInverse : muted ? palette.inkTertiary : palette.ink;
  // El seleccionado se despega del mapa; el lleno se queda pegado a él.
  const elevation = selected ? shadow.floating : muted ? shadow.none : shadow.raised;

  return (
    <Animated.View style={[styles.root, animatedStyle]} pointerEvents="box-none">
      <PressableScale
        onPress={onPress}
        haptic
        scaleTo={0.94}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected }}
        style={[
          styles.pill,
          elevation,
          {
            backgroundColor: background,
            borderColor: selected ? palette.ink : palette.hairline,
          },
        ]}
      >
        <Text variant="caption" weight="700" style={{ color: foreground }} numberOfLines={1}>
          {formatCop(price)}
        </Text>
      </PressableScale>
      <View
        style={[
          styles.notch,
          {
            backgroundColor: background,
            borderColor: selected ? palette.ink : palette.hairline,
          },
        ]}
        pointerEvents="none"
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
  },
  pill: {
    height: PILL_HEIGHT,
    minWidth: 62,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notch: {
    width: NOTCH_SIZE,
    height: NOTCH_SIZE,
    marginTop: -NOTCH_OVERLAP,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    transform: [{ rotate: '45deg' }],
  },
});
