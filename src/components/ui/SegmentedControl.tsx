import { useCallback, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

import { motion, palette, radius, space } from '@/constants/theme';
import { Text } from './Text';

export type Segment<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedControlProps<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * A sliding indicator rather than a filled pill per segment: one moving object
 * reads as a single control instead of a row of buttons.
 */
export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    segments.findIndex((segment) => segment.value === value),
  );
  const segmentWidth = segments.length > 0 ? width / segments.length : 0;

  const offset = useDerivedValue(() => withSpring(index * segmentWidth, motion.spring.snappy));

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
    width: segmentWidth,
  }));

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width - 2 * PADDING);
    if (Platform.OS === 'android') LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  return (
    <View style={styles.track} onLayout={onLayout} accessibilityRole="tablist">
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {segments.map((segment) => {
        const selected = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            onPress={() => onChange(segment.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={segment.label}
            style={styles.segment}
          >
            <Text
              variant="subhead"
              color={selected ? 'ink' : 'inkSecondary'}
              weight={selected ? '600' : '500'}
              numberOfLines={1}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const PADDING = 3;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: radius.sm,
    padding: PADDING,
    height: 40,
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
    bottom: PADDING,
    backgroundColor: palette.bg,
    borderRadius: radius.xs + 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
});
