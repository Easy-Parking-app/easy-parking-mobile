import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { motion, palette, radius } from '@/constants/theme';

export type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
  /** Silences the haptic — used by the haptics setting itself. */
  silent?: boolean;
};

const TRACK_WIDTH = 51;
const TRACK_HEIGHT = 31;
const KNOB = 27;
const INSET = 2;

/**
 * Switch de la casa.
 *
 * Se usa el mismo resorte que los marcadores del mapa, así encender un ajuste
 * se siente igual que seleccionar un parqueadero.
 */
export function Toggle({
  value,
  onValueChange,
  accessibilityLabel,
  disabled = false,
  silent = false,
}: ToggleProps) {
  const progress = useDerivedValue(() => withSpring(value ? 1 : 0, motion.spring.snappy), [value]);

  useEffect(() => {
    // El aviso háptico lo dispara el press, no el cambio de valor programático.
  }, []);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [palette.surfaceAlt, palette.ink],
    ),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(progress.value * (TRACK_WIDTH - KNOB - INSET * 2), motion.spring.snappy) },
    ],
    opacity: withTiming(disabled ? 0.6 : 1, { duration: motion.duration.instant }),
  }));

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        if (!silent && Platform.OS !== 'web') void Haptics.selectionAsync();
        onValueChange(!value);
      }}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      hitSlop={8}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: radius.pill,
    padding: INSET,
    justifyContent: 'center',
  },
  knob: {
    width: KNOB,
    height: KNOB,
    borderRadius: radius.pill,
    backgroundColor: palette.bg,
    shadowColor: '#0A0D12',
    shadowOpacity: 0.16,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
