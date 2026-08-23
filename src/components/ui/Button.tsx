import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { layout, palette, radius, space } from '@/constants/theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  /** Places the icon after the label instead of before it. */
  iconTrailing?: boolean;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
  testID?: string;
};

const surfaceFor: Record<ButtonVariant, string> = {
  primary: palette.ink,
  secondary: palette.surface,
  ghost: 'transparent',
  accent: palette.accent,
  danger: palette.dangerSoft,
};

const labelFor: Record<ButtonVariant, string> = {
  primary: palette.inkInverse,
  secondary: palette.ink,
  ghost: palette.ink,
  accent: palette.inkInverse,
  danger: palette.danger,
};

const heights: Record<ButtonSize, number> = {
  sm: layout.controlHeight.sm,
  md: layout.controlHeight.md,
  lg: layout.controlHeight.lg,
};

/**
 * Cuánto ampliar el área táctil para llegar al mínimo de 44 pt.
 *
 * El tamaño `sm` mide 36 y se queda corto. Engordarlo visualmente lo
 * convertiría en un botón mediano y perdería su razón de ser, así que se separa
 * lo que se ve de lo que se toca. Los tamaños que ya llegan devuelven 0.
 */
const touchSlop = (size: ButtonSize) =>
  Math.max(0, (layout.hitSlopMin - heights[size]) / 2);

const paddings: Record<ButtonSize, number> = {
  sm: space.md,
  md: space.base,
  lg: space.lg,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  iconTrailing = false,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const inactive = disabled || loading;
  const background = surfaceFor[variant];
  const foreground = labelFor[variant];
  const iconSize = size === 'sm' ? 16 : 18;

  const glyph = Icon ? (
    <Icon size={iconSize} color={foreground} strokeWidth={2} />
  ) : null;

  return (
    <PressableScale
      onPress={inactive ? undefined : onPress}
      disabled={inactive}
      haptic
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      testID={testID}
      hitSlop={{ top: touchSlop(size), bottom: touchSlop(size) }}
      style={[
        styles.base,
        {
          height: heights[size],
          paddingHorizontal: paddings[size],
          backgroundColor: background,
          opacity: disabled ? 0.4 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} size="small" />
      ) : (
        <View style={styles.content}>
          {!iconTrailing && glyph}
          <Text
            variant={size === 'sm' ? 'subhead' : 'headline'}
            style={{ color: foreground }}
            numberOfLines={1}
          >
            {label}
          </Text>
          {iconTrailing && glyph}
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
});
