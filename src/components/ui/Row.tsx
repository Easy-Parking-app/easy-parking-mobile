import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react-native';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { palette, radius, space } from '@/constants/theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type RowProps = {
  label: string;
  detail?: string;
  value?: string;
  icon?: LucideIcon;
  onPress?: () => void;
  /** Shows a chevron. Defaults to true when `onPress` is provided. */
  chevron?: boolean;
  destructive?: boolean;
  right?: ReactNode;
  style?: ViewStyle;
};

/**
 * The grouped-list row used across profile, parking detail and reservations.
 * Icon on the leading edge, label + optional detail, value or chevron trailing.
 */
export function Row({
  label,
  detail,
  value,
  icon: Icon,
  onPress,
  chevron,
  destructive = false,
  right,
  style,
}: RowProps) {
  const showChevron = chevron ?? onPress != null;
  const tint = destructive ? palette.danger : palette.ink;

  const content = (
    <View style={[styles.root, style]}>
      {Icon ? (
        <View style={styles.glyph}>
          <Icon size={18} color={destructive ? palette.danger : palette.inkSecondary} strokeWidth={2} />
        </View>
      ) : null}

      <View style={styles.body}>
        <Text variant="callout" style={{ color: tint }} numberOfLines={1}>
          {label}
        </Text>
        {detail ? (
          <Text variant="footnote" color="inkTertiary" numberOfLines={2}>
            {detail}
          </Text>
        ) : null}
      </View>

      {right}
      {value ? (
        <Text variant="callout" color="inkSecondary" numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {showChevron ? <ChevronRight size={18} color={palette.inkTertiary} strokeWidth={2} /> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.99}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={detail}
    >
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 52,
    paddingVertical: space.md,
    paddingHorizontal: space.base,
  },
  glyph: {
    width: 32,
    height: 32,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  body: {
    flex: 1,
    gap: 2,
  },
});
