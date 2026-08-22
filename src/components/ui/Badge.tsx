import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { palette, radius, space } from '@/constants/theme';
import type { AvailabilityLevel } from '@/types';
import { availabilityTone } from '@/utils/availability';
import { Text } from './Text';

export type BadgeProps = {
  label: string;
  fg?: string;
  bg?: string;
  icon?: LucideIcon;
  style?: ViewStyle;
};

export function Badge({ label, fg = palette.ink, bg = palette.surface, icon: Icon, style }: BadgeProps) {
  return (
    <View style={[styles.base, { backgroundColor: bg }, style]}>
      {Icon ? <Icon size={12} color={fg} strokeWidth={2.5} /> : null}
      <Text variant="caption2" style={{ color: fg }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Availability is the single most scanned attribute, so it gets its own badge. */
export function AvailabilityBadge({
  level,
  style,
}: {
  level: AvailabilityLevel;
  style?: ViewStyle;
}) {
  const tone = availabilityTone(level);
  return <Badge label={tone.label} fg={tone.fg} bg={tone.bg} style={style} />;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.sm,
    height: 22,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});
