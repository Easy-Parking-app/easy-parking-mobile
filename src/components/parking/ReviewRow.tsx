import { StyleSheet, View } from 'react-native';

import { space } from '@/constants/theme';
import type { Review } from '@/types';
import { formatMonth } from '@/utils/format';
import { Avatar } from '@/components/ui/Avatar';
import { Rating } from '@/components/ui/Rating';
import { Text } from '@/components/ui/Text';

export function ReviewRow({ review }: { review: Review }) {
  return (
    <View style={styles.root}>
      <Avatar name={review.author} uri={review.avatarUrl} size={36} />
      <View style={styles.body}>
        <View style={styles.header}>
          <Text variant="subhead" weight="600">
            {review.author}
          </Text>
          <Text variant="caption" color="inkTertiary">
            {formatMonth(review.date.slice(0, 7))}
          </Text>
        </View>
        <Rating value={review.rating} />
        <Text variant="subhead" color="inkSecondary">
          {review.comment}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.md,
  },
  body: {
    flex: 1,
    gap: space.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
});
