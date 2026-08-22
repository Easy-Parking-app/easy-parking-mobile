import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, space } from '@/constants/theme';

export type ScreenProps = {
  children: ReactNode;
  /** Which safe-area edges to honour. Bottom is opt-in — sticky bars own it. */
  edges?: Array<'top' | 'bottom'>;
  background?: 'bg' | 'surface';
  style?: ViewStyle;
};

/**
 * Applies safe-area padding explicitly rather than wrapping in SafeAreaView, so
 * full-bleed content (map, photo galleries) can still reach the screen edges.
 */
export function Screen({ children, edges = ['top'], background = 'bg', style }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: palette[background] },
        edges.includes('top') ? { paddingTop: insets.top } : null,
        edges.includes('bottom') ? { paddingBottom: insets.bottom } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Bottom bar that floats above content and respects the home indicator. */
export function StickyBar({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.stickyBar,
        { paddingBottom: Math.max(insets.bottom, space.base) },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  stickyBar: {
    backgroundColor: palette.bg,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.hairline,
  },
});
