import { memo } from 'react';
import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';

import { palette, type ColorToken, type TypeVariant, type as typeScale } from '@/constants/theme';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
  /** Overrides the weight of the chosen variant. Use sparingly. */
  weight?: '400' | '500' | '600' | '700';
};

/**
 * The only text primitive in the app. Every size, weight and tracking value
 * comes from the type scale, which is why screens never touch `fontSize`.
 */
export const Text = memo(function Text({
  variant = 'body',
  color = 'ink',
  align,
  weight,
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      {...rest}
      style={[
        typeScale[variant],
        { color: palette[color] },
        align ? { textAlign: align } : null,
        weight ? { fontWeight: weight } : null,
        style,
      ]}
    />
  );
});

/** Small all-caps label used above grouped sections. */
export const Overline = memo(function Overline({
  style,
  ...rest
}: Omit<TextProps, 'variant'>) {
  return (
    <Text
      variant="overline"
      color="inkTertiary"
      {...rest}
      style={[styles.overline, style]}
    />
  );
});

const styles = StyleSheet.create({
  overline: { textTransform: 'uppercase' },
});
