import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CircleParking } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { DateStrip } from '@/components/booking/DateStrip';
import { PriceSummary } from '@/components/booking/PriceSummary';
import { TimeField } from '@/components/booking/TimeField';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Screen, StickyBar } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Surface } from '@/components/ui/Surface';
import { Overline, Text } from '@/components/ui/Text';
import { palette, radius, space } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { fetchParking } from '@/services/parkings';
import { useBookingStore } from '@/store/useBookingStore';
import { formatCop, formatLongDate, formatMinutes, fromIsoDateAndMinutes } from '@/utils/format';
import { isDayRateApplied, quote } from '@/utils/pricing';

/**
 * Choosing a slot.
 *
 * Date, entry and exit — nothing else. The price recalculates as the driver
 * moves the handles, and the total in the sticky bar is the number they will be
 * charged, so checkout holds no surprises.
 */
export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: parking, loading, error, reload } = useAsync(() => fetchParking(id ?? ''), [id]);

  const parkingId = useBookingStore((state) => state.parkingId);
  const date = useBookingStore((state) => state.date);
  const startMinutes = useBookingStore((state) => state.startMinutes);
  const endMinutes = useBookingStore((state) => state.endMinutes);
  const start = useBookingStore((state) => state.start);
  const setDate = useBookingStore((state) => state.setDate);
  const setStart = useBookingStore((state) => state.setStart);
  const setEnd = useBookingStore((state) => state.setEnd);

  useEffect(() => {
    if (id && parkingId !== id) start(id);
  }, [id, parkingId, start]);

  const price = useMemo(
    () =>
      parking
        ? quote(parking, startMinutes, endMinutes)
        : { hours: 0, subtotal: 0, serviceFee: 0, total: 0 },
    [parking, startMinutes, endMinutes],
  );

  const dayRate = parking ? isDayRateApplied(parking, startMinutes, endMinutes) : false;
  const selectedDate = fromIsoDateAndMinutes(date, 0);

  if (loading) {
    return (
      <Screen edges={['top']}>
        <View style={styles.loading}>
          <Skeleton height={88} rounded={radius.md} />
          <Skeleton height={74} rounded={radius.sm} />
          <Skeleton height={64} rounded={radius.sm} />
          <Skeleton height={160} rounded={radius.sm} />
        </View>
      </Screen>
    );
  }

  if (error || !parking) {
    return (
      <Screen edges={['top']}>
        <Header onBack={() => router.back()} title="Elegir horario" />
        <EmptyState
          icon={CircleParking}
          tone="error"
          title="No pudimos cargar el parqueadero"
          message={error ?? 'Intenta de nuevo en un momento.'}
          actionLabel="Reintentar"
          onAction={reload}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <Header onBack={() => router.back()} title="Elegir horario" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Surface elevation="hairline" padded={false} style={styles.summary}>
          <Image
            source={{ uri: parking.photos[0] }}
            style={styles.thumb}
            contentFit="cover"
            transition={160}
            accessibilityIgnoresInvertColors
          />
          <View style={styles.summaryBody}>
            <Text variant="headline" numberOfLines={1}>
              {parking.name}
            </Text>
            <Text variant="footnote" color="inkTertiary" numberOfLines={1}>
              {parking.address} · {parking.zone}
            </Text>
            <Text variant="footnote" color="inkSecondary">
              {formatCop(parking.pricePerHour)}/hora
            </Text>
          </View>
        </Surface>

        <View style={styles.block}>
          <Overline style={styles.blockTitle}>Fecha</Overline>
          <DateStrip value={date} onChange={setDate} />
          <Text variant="footnote" color="inkTertiary" style={styles.blockTitle}>
            {formatLongDate(selectedDate)}
          </Text>
        </View>

        <View style={[styles.block, styles.blockPadded]}>
          <Overline>Horario</Overline>
          <View style={styles.times}>
            <View style={styles.timeField}>
              <TimeField
                label="Entrada"
                value={startMinutes}
                onChange={setStart}
                max={23 * 60}
              />
            </View>
            <View style={styles.timeField}>
              <TimeField
                label="Salida"
                value={endMinutes}
                onChange={setEnd}
                min={startMinutes + 60}
              />
            </View>
          </View>
        </View>

        <View style={[styles.block, styles.blockPadded]}>
          <Overline>Resumen</Overline>
          <PriceSummary price={price} dayRateApplied={dayRate} />
        </View>
      </ScrollView>

      <StickyBar>
        <View style={styles.footer}>
          <View>
            <Text variant="caption" color="inkTertiary">
              {formatMinutes(startMinutes)} – {formatMinutes(endMinutes)}
            </Text>
            <Text variant="title3">{formatCop(price.total)}</Text>
          </View>
          <Button
            label="Continuar"
            onPress={() => router.push('/checkout')}
            fullWidth={false}
            style={styles.footerCta}
          />
        </View>
      </StickyBar>
    </Screen>
  );
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <View style={styles.header}>
      <IconButton icon={ArrowLeft} tone="filled" onPress={onBack} accessibilityLabel="Volver" />
      <Text variant="headline">{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  headerSpacer: {
    width: 44,
  },
  loading: {
    padding: space.lg,
    gap: space.base,
  },
  content: {
    paddingBottom: space.xxl,
    gap: space.xl,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginHorizontal: space.lg,
    padding: space.md,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: radius.xs,
    backgroundColor: palette.surface,
  },
  summaryBody: {
    flex: 1,
    gap: 2,
  },
  block: {
    gap: space.md,
  },
  blockPadded: {
    paddingHorizontal: space.lg,
  },
  blockTitle: {
    paddingHorizontal: space.lg,
  },
  times: {
    flexDirection: 'row',
    gap: space.md,
  },
  timeField: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.base,
  },
  footerCta: {
    minWidth: 168,
  },
});
