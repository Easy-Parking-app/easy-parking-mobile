import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { palette, radius, space } from '@/constants/theme';

export type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  rounded?: number;
  style?: ViewStyle;
};

/**
 * A calm pulse, not a shimmer sweep. Loading should feel like the content is
 * about to arrive, not like the screen is performing.
 */
export function Skeleton({ width = '100%', height = 16, rounded = radius.xs, style }: SkeletonProps) {
  const progress = useSharedValue(0.6);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width, height, borderRadius: rounded, backgroundColor: palette.surface },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Placeholder matching the shape of a parking row in the sheet. */
export function ParkingRowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton width={72} height={72} rounded={radius.sm} />
      <View style={styles.rowBody}>
        <Skeleton width="62%" height={17} />
        <Skeleton width="45%" height={13} />
        <Skeleton width="34%" height={13} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.md,
  },
  rowBody: {
    flex: 1,
    gap: space.sm,
    justifyContent: 'center',
  },
});
