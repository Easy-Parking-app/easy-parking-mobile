import { Image } from 'expo-image';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { palette, radius, space } from '@/constants/theme';

export type PhotoGalleryProps = {
  photos: string[];
  height: number;
  width: number;
  label: string;
};

/** Paged, full-bleed gallery with dot indicators — no captions, no chrome. */
export function PhotoGallery({ photos, height, width, label }: PhotoGalleryProps) {
  const [index, setIndex] = useState(0);
  const lastIndex = useRef(0);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(event.nativeEvent.contentOffset.x / width);
      if (next !== lastIndex.current) {
        lastIndex.current = next;
        setIndex(next);
      }
    },
    [width],
  );

  return (
    <View style={{ height, width }} accessibilityLabel={`Fotos de ${label}`}>
      <FlatList
        data={photos}
        keyExtractor={(uri, position) => `${uri}-${position}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, position) => ({ length: width, offset: width * position, index: position })}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{ width, height }}
            contentFit="cover"
            transition={220}
            accessibilityIgnoresInvertColors
          />
        )}
      />

      {photos.length > 1 ? (
        <View style={styles.dots} pointerEvents="none">
          {photos.map((uri, position) => (
            <View
              key={`${uri}-dot-${position}`}
              style={[styles.dot, position === index ? styles.dotActive : null]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute',
    bottom: space.xxl + space.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.xs + 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.inkInverse,
    opacity: 0.45,
  },
  dotActive: {
    opacity: 1,
    width: 18,
  },
});
