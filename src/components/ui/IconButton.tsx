import { StyleSheet, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { palette, radius, shadow } from '@/constants/theme';
import { PressableScale } from './PressableScale';

export type IconButtonProps = {
  icon: LucideIcon;
  onPress?: () => void;
  /** `plain` on surfaces, `floating` over photography or the map. */
  tone?: 'plain' | 'floating' | 'filled';
  size?: number;
  color?: string;
  accessibilityLabel: string;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
};

/** 44pt circular target — the HIG minimum — regardless of the glyph size. */
export function IconButton({
  icon: Icon,
  onPress,
  tone = 'plain',
  size = 20,
  color,
  accessibilityLabel,
  disabled = false,
  style,
  testID,
}: IconButtonProps) {
  const background =
    tone === 'floating' ? palette.bg : tone === 'filled' ? palette.surface : 'transparent';

  return (
    <PressableScale
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      testID={testID}
      style={[
        styles.base,
        { backgroundColor: background, opacity: disabled ? 0.4 : 1 },
        tone === 'floating' ? shadow.raised : null,
        style,
      ]}
    >
      <Icon size={size} color={color ?? palette.ink} strokeWidth={2} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
