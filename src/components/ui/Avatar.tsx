import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { palette, radius } from '@/constants/theme';
import { initials } from '@/utils/format';
import { Text } from './Text';

export type AvatarProps = {
  name: string;
  uri?: string;
  size?: number;
};

/** Initials fallback keeps the app looking finished without stock portraits. */
export function Avatar({ name, uri, size = 40 }: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radius.pill }}
        contentFit="cover"
        accessibilityLabel={name}
        transition={160}
      />
    );
  }

  return (
    <View
      style={[styles.fallback, { width: size, height: size }]}
      accessibilityLabel={name}
    >
      <Text
        variant={size >= 56 ? 'title3' : size >= 40 ? 'subhead' : 'caption'}
        color="inkSecondary"
      >
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
