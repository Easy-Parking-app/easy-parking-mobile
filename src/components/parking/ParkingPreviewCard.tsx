import { Image } from 'expo-image';
import { ArrowUpRight, Footprints } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { palette, radius, space } from '@/constants/theme';
import type { Parking } from '@/types';
import { availabilityDetail, availabilityLevel } from '@/utils/availability';
import { formatCop, formatDistance, formatWalkingTime } from '@/utils/format';
import { AvailabilityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PressableScale } from '@/components/ui/PressableScale';
import { Rating } from '@/components/ui/Rating';
import { Text } from '@/components/ui/Text';

export type ParkingPreviewCardProps = {
  parking: Parking;
  onOpen: () => void;
  onReserve: () => void;
};

/**
 * What the sheet becomes when a marker is selected: one parking, the three
 * facts that decide the tap, and a single primary action.
 */
export function ParkingPreviewCard({ parking, onOpen, onReserve }: ParkingPreviewCardProps) {
  const level = availabilityLevel(parking);
  const soldOut = level === 'lleno';

  return (
    <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(120)} style={styles.root}>
      <PressableScale
        onPress={onOpen}
        scaleTo={0.99}
        accessibilityRole="button"
        accessibilityLabel={`Ver ${parking.name}`}
        style={styles.header}
      >
        <Image
          source={{ uri: parking.photos[0] }}
          style={styles.photo}
          contentFit="cover"
          transition={200}
          accessibilityIgnoresInvertColors
        />
        <View style={styles.headerBody}>
          <View style={styles.titleRow}>
            <Text variant="title3" numberOfLines={1} style={styles.title}>
              {parking.name}
            </Text>
            <ArrowUpRight size={18} color={palette.inkTertiary} strokeWidth={2} />
          </View>

          <Text variant="footnote" color="inkSecondary" numberOfLines={1}>
            {parking.address} · {parking.zone}
          </Text>

          <View style={styles.metaRow}>
            <Rating value={parking.rating} count={parking.reviewCount} />
            {parking.distanceMeters != null ? (
              <View style={styles.walk}>
                <Footprints size={13} color={palette.inkTertiary} strokeWidth={2} />
                <Text variant="footnote" color="inkTertiary">
                  {formatDistance(parking.distanceMeters)} · {formatWalkingTime(parking.distanceMeters)}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </PressableScale>

      <View style={styles.footer}>
        <View style={styles.priceBlock}>
          <View style={styles.priceRow}>
            <Text variant="title2">{formatCop(parking.pricePerHour)}</Text>
            <Text variant="footnote" color="inkTertiary">
              /hora
            </Text>
          </View>
          <AvailabilityBadge level={level} />
        </View>

        <Button
          label={soldOut ? 'Sin cupos' : 'Reservar'}
          onPress={onReserve}
          disabled={soldOut}
          fullWidth={false}
          accessibilityHint={soldOut ? undefined : availabilityDetail(parking)}
          style={styles.cta}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space.base,
  },
  header: {
    flexDirection: 'row',
    gap: space.md,
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: radius.sm,
    backgroundColor: palette.surface,
  },
  headerBody: {
    flex: 1,
    gap: space.xs,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  title: {
    flexShrink: 1,
  },
  metaRow: {
    gap: space.xs,
    marginTop: 2,
  },
  walk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.base,
  },
  priceBlock: {
    gap: space.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.xs,
  },
  cta: {
    minWidth: 148,
  },
});
