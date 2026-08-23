import { StyleSheet, View, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Check } from 'lucide-react-native';

import { layout, palette, radius, space } from '@/constants/theme';
import { PressableScale } from './PressableScale';
import { Text } from './Text';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
  /** Shows a check glyph when selected. Used in the filter sheet. */
  showCheck?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

/** Alto visual. Ver `TOUCH_SLOP` para por qué no es también el táctil. */
const HEIGHT = 36;

/**
 * Una píldora de 44 pt de alto se ve pesada en una fila de filtros, pero 36 pt
 * quedan por debajo del mínimo táctil que exige el proyecto. El `hitSlop`
 * separa las dos cosas: se ve de 36 y se toca como si midiera 44.
 */
const TOUCH_SLOP = (layout.hitSlopMin - HEIGHT) / 2;

/**
 * Selection state reads three ways at once — fill, border and label colour —
 * so it never depends on colour alone.
 */
export function Chip({
  label,
  selected = false,
  onPress,
  icon: Icon,
  showCheck = false,
  disabled = false,
  style,
}: ChipProps) {
  const foreground = selected ? palette.inkInverse : palette.ink;

  return (
    <PressableScale
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      hitSlop={{ top: TOUCH_SLOP, bottom: TOUCH_SLOP }}
      style={[
        styles.base,
        {
          backgroundColor: selected ? palette.ink : palette.bg,
          borderColor: selected ? palette.ink : palette.hairline,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {Icon ? <Icon size={15} color={foreground} strokeWidth={2} /> : null}
        <Text variant="subhead" style={{ color: foreground }} numberOfLines={1}>
          {label}
        </Text>
        {showCheck && selected ? (
          <Check size={15} color={foreground} strokeWidth={2.5} />
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    height: HEIGHT,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
  },
});
