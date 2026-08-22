import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, X } from 'lucide-react-native';
import { useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { photo } from '@/mocks/photos';
import { palette, radius, space } from '@/constants/theme';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';

export type PhotoPickerGridProps = {
  photos: string[];
  onAdd: (uri: string) => void;
  onRemove: (uri: string) => void;
  max?: number;
};

/** Sample images used when the device library is unavailable (web, denied permission). */
const SAMPLES = [photo.garageA, photo.lotA, photo.garageC, photo.carA, photo.lotE, photo.garageF];

export function PhotoPickerGrid({ photos, onAdd, onRemove, max = 6 }: PhotoPickerGridProps) {
  const addSample = useCallback(() => {
    const next = SAMPLES.find((uri) => !photos.includes(uri));
    if (next) onAdd(next);
  }, [onAdd, photos]);

  const pick = useCallback(async () => {
    // The web build is the QA surface, not a real device: skip the file dialog
    // and drop in a sample so the flow stays walkable.
    if (Platform.OS === 'web') {
      addSample();
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsMultipleSelection: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset) onAdd(asset.uri);
    } catch {
      addSample();
    }
  }, [addSample, onAdd]);

  return (
    <View style={styles.grid}>
      {photos.map((uri, index) => (
        <View key={`${uri}-${index}`} style={styles.tile}>
          <Image
            source={{ uri }}
            style={styles.image}
            contentFit="cover"
            transition={160}
            accessibilityIgnoresInvertColors
          />
          <IconButton
            icon={X}
            size={14}
            tone="floating"
            onPress={() => onRemove(uri)}
            accessibilityLabel="Quitar la foto"
            style={styles.remove}
          />
          {index === 0 ? (
            <View style={styles.cover}>
              <Text variant="caption2" color="inkInverse">
                Portada
              </Text>
            </View>
          ) : null}
        </View>
      ))}

      {photos.length < max ? (
        <PressableScale
          onPress={pick}
          accessibilityRole="button"
          accessibilityLabel="Agregar una foto"
          style={[styles.tile, styles.add]}
        >
          <ImagePlus size={22} color={palette.inkTertiary} strokeWidth={1.75} />
          <Text variant="caption" color="inkTertiary">
            Agregar
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  tile: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: palette.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  add: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  remove: {
    position: 'absolute',
    top: space.xs,
    right: space.xs,
    width: 28,
    height: 28,
  },
  cover: {
    position: 'absolute',
    left: space.xs,
    bottom: space.xs,
    paddingHorizontal: space.sm,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
