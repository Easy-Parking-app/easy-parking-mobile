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

  const background = selected ? palette.ink : palette.bg;
  const foreground = selected ? palette.inkInverse : palette.ink;

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
          shadow.raised,
          {
            backgroundColor: background,
            borderColor: selected ? palette.ink : palette.hairline,
            opacity: unavailable ? 0.55 : 1,
          },
        ]}
      >
        <Text variant="caption" weight="700" style={{ color: foreground }} numberOfLines={1}>
          {formatCop(price)}
        </Text>
      </PressableScale>
      <View
        style={[styles.notch, { backgroundColor: background, borderColor: selected ? palette.ink : palette.hairline }]}
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
    height: 30,
    minWidth: 62,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notch: {
    width: 8,
    height: 8,
    marginTop: -4,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    transform: [{ rotate: '45deg' }],
  },
});
