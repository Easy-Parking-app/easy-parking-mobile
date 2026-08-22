import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { motion, palette } from '@/constants/theme';
import type { LatLng } from '@/types';
import { project, type Region } from '@/utils/geo';
import { MapBackdrop } from './MapBackdrop';
import { PriceMarker } from './PriceMarker';
import type { MapViewProps } from './types';
import { UserDot } from './UserDot';

/** How much larger the drawn world is than the viewport, so panning reveals more. */
const OVERSCAN = 2.4;
/** About 5 km across the visible band — close enough to walk, wide enough to compare. */
const BASE_LATITUDE_DELTA = 0.09;

/**
 * Mock map surface.
 *
 * Coordinates are projected once into a fixed "world" layer; panning moves that
 * layer rather than recomputing positions, so dragging stays at 60fps and the
 * markers never drift relative to the streets.
 */
export function MapCanvas({
  markers,
  selectedId,
  onSelectMarker,
  userLocation,
  focus,
  bottomInset = 0,
  topInset = 0,
  interactive = true,
  style,
}: MapViewProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  }, []);

  const world = useMemo(
    () => ({ width: size.width * OVERSCAN, height: size.height * OVERSCAN }),
    [size.width, size.height],
  );

  const region: Region = useMemo(() => {
    const aspect = size.height > 0 ? size.width / size.height : 0.6;
    const latitudeDelta = BASE_LATITUDE_DELTA * OVERSCAN;
    return {
      center: userLocation,
      latitudeDelta,
      longitudeDelta: latitudeDelta * aspect,
    };
  }, [userLocation, size.width, size.height]);

  const toPoint = useCallback(
    (coordinate: LatLng) => project(coordinate, region, world),
    [region, world],
  );

  /**
   * Markers in the same block would otherwise sit on top of each other. A greedy
   * pass nudges collisions upward — the same trick real maps use before they
   * fall back to clustering.
   */
  const placed = useMemo(() => {
    const result: Array<{ marker: (typeof markers)[number]; x: number; y: number }> = [];
    // Nearest first: the markers a driver cares about keep their true position,
    // and only the further ones get nudged out of the way.
    const center = toPoint(userLocation);
    const sorted = [...markers].sort((a, b) => {
      const pa = toPoint(a.coordinate);
      const pb = toPoint(b.coordinate);
      return Math.hypot(pa.x - center.x, pa.y - center.y) - Math.hypot(pb.x - center.x, pb.y - center.y);
    });

    // Alternating offsets keep a cluster balanced instead of drifting one way.
    const offsets = [0, MARKER_ROW_HEIGHT, -MARKER_ROW_HEIGHT, 2 * MARKER_ROW_HEIGHT, -2 * MARKER_ROW_HEIGHT];

    for (const marker of sorted) {
      const point = toPoint(marker.coordinate);
      const free =
        offsets.find(
          (offset) =>
            !result.some(
              (other) =>
                Math.abs(other.x - point.x) < MARKER_WIDTH &&
                Math.abs(other.y - (point.y + offset)) < MARKER_ROW_HEIGHT,
            ),
        ) ?? 0;
      result.push({ marker, x: point.x, y: point.y + free });
    }

    return result;
  }, [markers, toPoint, userLocation]);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const maxX = Math.max(0, world.width - size.width);
  const maxY = Math.max(0, world.height - size.height);

  /** Centres the viewport on a coordinate, accounting for the sheet inset. */
  const centerOn = useCallback(
    (coordinate: LatLng, animated = true) => {
      if (size.width === 0) return;
      const point = toPoint(coordinate);
      // Centre inside the band left free by the controls and the sheet.
      const bandCenter = topInset + (size.height - topInset - bottomInset) / 2;
      const targetX = clamp(size.width / 2 - point.x, -maxX, 0);
      const targetY = clamp(bandCenter - point.y, -maxY, 0);

      if (animated) {
        translateX.value = withSpring(targetX, motion.spring.gentle);
        translateY.value = withSpring(targetY, motion.spring.gentle);
      } else {
        translateX.value = targetX;
        translateY.value = targetY;
      }
    },
    [bottomInset, topInset, maxX, maxY, size.height, size.width, toPoint, translateX, translateY],
  );

  useEffect(() => {
    centerOn(focus ?? userLocation);
  }, [centerOn, focus, userLocation]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(interactive)
        .onStart(() => {
          startX.value = translateX.value;
          startY.value = translateY.value;
        })
        .onUpdate((event) => {
          translateX.value = clamp(startX.value + event.translationX, -maxX, 0);
          translateY.value = clamp(startY.value + event.translationY, -maxY, 0);
        })
        .onEnd((event) => {
          translateX.value = withSpring(
            clamp(translateX.value + event.velocityX * 0.08, -maxX, 0),
            motion.spring.gentle,
          );
          translateY.value = withSpring(
            clamp(translateY.value + event.velocityY * 0.08, -maxY, 0),
            motion.spring.gentle,
          );
        }),
    [interactive, maxX, maxY, startX, startY, translateX, translateY],
  );

  const worldStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
  }));

  const userPoint = toPoint(userLocation);

  return (
    <View style={[styles.root, style]} onLayout={onLayout}>
      {size.width > 0 ? (
        <GestureDetector gesture={pan}>
          <Animated.View style={[{ width: world.width, height: world.height }, worldStyle]}>
            <MapBackdrop width={world.width} height={world.height} />

            {/* Tapping empty map clears the selection, like Maps does. */}
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => onSelectMarker(null)}
              accessibilityRole="none"
              accessible={false}
            />

            <View
              style={[styles.pin, { left: userPoint.x - 22, top: userPoint.y - 22 }]}
              pointerEvents="none"
            >
              <UserDot />
            </View>

            {placed.map(({ marker, x, y }) => {
              const selected = marker.id === selectedId;
              return (
                <View
                  key={marker.id}
                  pointerEvents="box-none"
                  style={[
                    styles.pin,
                    {
                      left: x - MARKER_WIDTH / 2,
                      top: y - MARKER_ROW_HEIGHT,
                      zIndex: selected ? 2 : 1,
                    },
                  ]}
                >
                  <PriceMarker
                    price={marker.price}
                    selected={selected}
                    unavailable={marker.unavailable}
                    accessibilityLabel={marker.label}
                    onPress={() => onSelectMarker(selected ? null : marker.id)}
                  />
                </View>
              );
            })}
          </Animated.View>
        </GestureDetector>
      ) : null}
    </View>
  );
}

const MARKER_WIDTH = 84;
const MARKER_ROW_HEIGHT = 38;

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: palette.mapLand,
  },
  pin: {
    position: 'absolute',
    width: MARKER_WIDTH,
    alignItems: 'center',
  },
});
