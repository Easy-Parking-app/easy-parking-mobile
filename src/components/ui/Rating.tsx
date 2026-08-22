import { Star } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { palette, space } from '@/constants/theme';
import { formatRating } from '@/utils/format';
import { Text } from './Text';

export type RatingProps = {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  color?: 'ink' | 'inkSecondary' | 'inkInverse';
};

export function Rating({ value, count, size = 'sm', color = 'ink' }: RatingProps) {
  const glyph = size === 'sm' ? 13 : 15;
  const tint = color === 'inkInverse' ? palette.inkInverse : palette.ink;

  return (
    <View
      style={styles.root}
      accessibilityLabel={
        count != null
          ? `Calificación ${formatRating(value)} de 5, ${count} reseñas`
          : `Calificación ${formatRating(value)} de 5`
      }
    >
      <Star size={glyph} color={tint} fill={tint} strokeWidth={0} />
      <Text variant={size === 'sm' ? 'footnote' : 'subhead'} color={color}>
        {formatRating(value)}
      </Text>
      {count != null ? (
        <Text variant={size === 'sm' ? 'footnote' : 'subhead'} color="inkTertiary">
          {`(${count})`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
});
