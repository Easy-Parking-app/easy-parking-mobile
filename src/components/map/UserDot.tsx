import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { palette, radius } from '@/constants/theme';

/** The driver's position: one accent dot, one slow breathing halo. */
export function UserDot() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
  }, [pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.22 * (1 - pulse.value),
    transform: [{ scale: 0.6 + pulse.value * 1.6 }],
  }));

  return (
    <View style={styles.root} pointerEvents="none" accessibilityLabel="Tu ubicación">
      <Animated.View style={[styles.halo, haloStyle]} />
      <View style={styles.ring}>
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  halo: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: palette.accent,
  },
  ring: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 13,
    height: 13,
    borderRadius: radius.pill,
    backgroundColor: palette.accent,
  },
});
