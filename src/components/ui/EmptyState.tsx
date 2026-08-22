import { StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { palette, radius, space } from '@/constants/theme';
import { Button } from './Button';
import { Text } from './Text';

export type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** `error` swaps the glyph tint to the danger colour. */
  tone?: 'neutral' | 'error';
};

/**
 * Used for empty, error and no-results states alike. One layout, three tones —
 * so a driver who hits any dead end sees the same calm shape.
 */
export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  tone = 'neutral',
}: EmptyStateProps) {
  const glyphColor = tone === 'error' ? palette.danger : palette.inkTertiary;
  const glyphBackground = tone === 'error' ? palette.dangerSoft : palette.surface;

  return (
    <View style={styles.root}>
      <View style={[styles.badge, { backgroundColor: glyphBackground }]}>
        <Icon size={26} color={glyphColor} strokeWidth={1.75} />
      </View>
      <Text variant="title3" align="center" style={styles.title}>
        {title}
      </Text>
      <Text variant="subhead" color="inkSecondary" align="center" style={styles.message}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          size="md"
          fullWidth={false}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    paddingHorizontal: space.xxl,
    paddingVertical: space.xxxl,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  title: {
    marginBottom: space.sm,
  },
  message: {
    maxWidth: 300,
  },
  action: {
    marginTop: space.xl,
  },
});
