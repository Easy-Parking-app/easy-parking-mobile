import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { palette, radius, space, type as typeScale } from '@/constants/theme';
import { Text } from './Text';

export type InputProps = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
  /** Text shown inside the field on the trailing edge, e.g. a currency suffix. */
  suffix?: string;
  containerStyle?: ViewStyle;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, hint, error, icon: Icon, suffix, containerStyle, style, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? palette.danger
    : focused
      ? palette.ink
      : palette.hairline;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text variant="footnote" color="inkSecondary" style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View style={[styles.field, { borderColor }]}>
        {Icon ? <Icon size={18} color={palette.inkTertiary} strokeWidth={2} /> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={palette.inkTertiary}
          selectionColor={palette.accent}
          accessibilityLabel={label ?? rest.placeholder}
          {...rest}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[styles.input, style]}
        />
        {suffix ? (
          <Text variant="callout" color="inkTertiary">
            {suffix}
          </Text>
        ) : null}
      </View>

      {error ? (
        <Text variant="footnote" color="danger" style={styles.hint}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="footnote" color="inkTertiary" style={styles.hint}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    marginBottom: space.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 52,
    paddingHorizontal: space.base,
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: palette.bg,
  },
  input: {
    flex: 1,
    paddingVertical: space.md,
    color: palette.ink,
    ...typeScale.body,
  },
  hint: {
    marginTop: space.sm,
  },
});
