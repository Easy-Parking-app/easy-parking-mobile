import { StyleSheet, View, type ViewStyle } from 'react-native';

import { palette, space } from '@/constants/theme';

export type DividerProps = {
  /** Indents the rule so it starts at the text, list-row style. */
  inset?: number;
  spacing?: number;
  style?: ViewStyle;
};

export function Divider({ inset = 0, spacing = 0, style }: DividerProps) {
  return (
    <View
      style={[
        styles.base,
        { marginLeft: inset, marginVertical: spacing },
        style,
      ]}
    />
  );
}

/** Vertical rule for inline metadata, e.g. `4,8 · 320 m`. */
export function DotSeparator() {
  return <View style={styles.dot} />;
}

const styles = StyleSheet.create({
  base: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: palette.hairline,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: palette.inkTertiary,
    marginHorizontal: space.sm,
  },
});
