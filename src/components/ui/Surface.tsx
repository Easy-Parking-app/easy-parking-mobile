import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { palette, radius, shadow, space } from '@/constants/theme';

export type SurfaceProps = {
  children: ReactNode;
  /** `hairline` for grouped content, `raised` for content that floats. */
  elevation?: 'flat' | 'hairline' | 'raised' | 'floating';
  padded?: boolean;
  style?: ViewStyle;
};

/**
 * The one container in the system. Cards, grouped rows and sheets are all this
 * component with a different elevation, which keeps corner radii consistent.
 */
export function Surface({
  children,
  elevation = 'hairline',
  padded = true,
  style,
}: SurfaceProps) {
  return (
    <View
      style={[
        styles.base,
        padded ? styles.padded : null,
        elevation === 'hairline' ? styles.hairline : null,
        elevation === 'raised' ? shadow.raised : null,
        elevation === 'floating' ? shadow.floating : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: palette.bgElevated,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  padded: {
    padding: space.base,
  },
  hairline: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.hairline,
  },
});
