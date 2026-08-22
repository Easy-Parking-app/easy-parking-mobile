import { Image } from 'expo-image';
import { BadgeCheck } from 'lucide-react-native';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { palette, radius, space } from '@/constants/theme';
import type { Parking } from '@/types';
import { availabilityLevel } from '@/utils/availability';
import { formatCop, formatDistance } from '@/utils/format';
import { AvailabilityBadge } from '@/components/ui/Badge';
import { PressableScale } from '@/components/ui/PressableScale';
import { Rating } from '@/components/ui/Rating';
import { Text } from '@/components/ui/Text';

export type ParkingRowProps = {
  parking: Parking;
  onPress: () => void;
  /** Highlights the row that matches the selected map marker. */
  active?: boolean;
};

/**
 * The scannable unit of the results list: photo, name, distance, rating,
 * availability, price. Nothing else — a row a driver can read at a glance while
 * walking.
 */
export const ParkingRow = memo(function ParkingRow({ parking, onPress, active = false }: ParkingRowProps) {
  const level = availabilityLevel(parking);

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityLabel={`${parking.name}, ${formatCop(parking.pricePerHour)} por hora`}
      accessibilityHint="Abre el detalle del parqueadero"
      style={[styles.root, active ? styles.active : null]}
    >
      <Image
        source={{ uri: parking.photos[0] }}
        style={styles.photo}
        contentFit="cover"
        transition={180}
        accessibilityIgnoresInvertColors
      />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text variant="headline" numberOfLines={1} style={styles.title}>
            {parking.name}
          </Text>
          {parking.verified ? (
            <BadgeCheck size={15} color={palette.accent} strokeWidth={2.25} />
          ) : null}
        </View>

        <Text variant="footnote" color="inkTertiary" numberOfLines={1}>
          {parking.zone}
          {parking.distanceMeters != null ? ` · ${formatDistance(parking.distanceMeters)}` : ''}
        </Text>

        <View style={styles.metaRow}>
          <Rating value={parking.rating} count={parking.reviewCount} />
        </View>

        <AvailabilityBadge level={level} style={styles.badge} />
      </View>

      <View style={styles.priceBlock}>
        <Text variant="headline">{formatCop(parking.pricePerHour)}</Text>
        <Text variant="caption" color="inkTertiary">
          por hora
        </Text>
      </View>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  active: {
    backgroundColor: palette.surface,
  },
  photo: {
    width: 76,
    height: 76,
    borderRadius: radius.sm,
    backgroundColor: palette.surface,
  },
  body: {
    flex: 1,
    gap: 3,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    marginTop: space.xs,
  },
  priceBlock: {
    alignItems: 'flex-end',
    gap: 1,
  },
});
