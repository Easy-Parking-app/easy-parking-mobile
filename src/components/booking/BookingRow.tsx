import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { palette, radius, space } from '@/constants/theme';
import type { Booking, BookingStatus } from '@/types';
import { formatCop, formatMinutes, formatRelativeShort, minutesOfDay } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';

const statusTone: Record<BookingStatus, { label: string; fg: string; bg: string }> = {
  proxima: { label: 'Próxima', fg: palette.accent, bg: palette.accentSoft },
  activa: { label: 'En curso', fg: palette.available, bg: palette.availableSoft },
  completada: { label: 'Completada', fg: palette.inkSecondary, bg: palette.surface },
  cancelada: { label: 'Cancelada', fg: palette.danger, bg: palette.dangerSoft },
};

export type BookingRowProps = {
  booking: Booking;
  onPress: () => void;
  /** Name of the driver, when rendered on the owner side. */
  guestName?: string;
};

/** One line per reservation: when, where, state, how much. */
export const BookingRow = memo(function BookingRow({ booking, onPress, guestName }: BookingRowProps) {
  const startsAt = new Date(booking.startsAt);
  const endsAt = new Date(booking.endsAt);
  const tone = statusTone[booking.status];
  const faded = booking.status === 'completada' || booking.status === 'cancelada';

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.99}
      accessibilityRole="button"
      accessibilityLabel={`Reserva ${booking.code} en ${booking.parking.name}`}
      style={styles.root}
    >
      <Image
        source={{ uri: booking.parking.photos[0] }}
        style={[styles.photo, faded ? styles.faded : null]}
        contentFit="cover"
        transition={160}
        accessibilityIgnoresInvertColors
      />

      <View style={styles.body}>
        <Text variant="headline" numberOfLines={1}>
          {booking.parking.name}
        </Text>
        <Text variant="footnote" color="inkTertiary" numberOfLines={1}>
          {formatRelativeShort(startsAt)} · {formatMinutes(minutesOfDay(startsAt))} –{' '}
          {formatMinutes(minutesOfDay(endsAt))}
        </Text>
        {guestName ? (
          <Text variant="footnote" color="inkSecondary" numberOfLines={1}>
            {guestName}
          </Text>
        ) : null}
        <Badge label={tone.label} fg={tone.fg} bg={tone.bg} style={styles.badge} />
      </View>

      <View style={styles.trailing}>
        <Text variant="subhead">{formatCop(booking.price.total)}</Text>
        <Text variant="caption" color="inkTertiary">
          {booking.code}
        </Text>
      </View>
    </PressableScale>
  );
});

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: palette.surface,
  },
  faded: {
    opacity: 0.55,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  badge: {
    marginTop: space.xxs,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 2,
  },
});
