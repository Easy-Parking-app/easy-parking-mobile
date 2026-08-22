import { useRouter } from 'expo-router';
import { ArrowLeft, CircleAlert } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EarningsChart } from '@/components/owner/EarningsChart';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Surface } from '@/components/ui/Surface';
import { Overline, Text } from '@/components/ui/Text';
import { radius, space } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { fetchOwnerListings, fetchOwnerSummary } from '@/services/owner';
import { formatCop, formatMonth } from '@/utils/format';

export default function OwnerEarningsScreen() {
  const router = useRouter();
  const summary = useAsync(() => fetchOwnerSummary(), []);
  const listings = useAsync(() => fetchOwnerListings(), []);

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon={ArrowLeft}
          tone="filled"
          onPress={() => router.back()}
          accessibilityLabel="Volver"
        />
        <Text variant="headline">Ingresos</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {summary.loading ? (
          <Skeleton height={220} rounded={radius.md} />
        ) : summary.error || !summary.data ? (
          <EmptyState
            icon={CircleAlert}
            tone="error"
            title="No pudimos cargar tus ingresos"
            message={summary.error ?? 'Intenta de nuevo en un momento.'}
            actionLabel="Reintentar"
            onAction={summary.reload}
          />
        ) : (
          <>
            <Surface elevation="hairline" style={styles.card}>
              <Overline>Este mes</Overline>
              <Text variant="display">{formatCop(summary.data.monthEarnings)}</Text>
              <EarningsChart data={summary.data.history} height={110} />
            </Surface>

            <View style={styles.group}>
              <Overline>Historial</Overline>
              {[...summary.data.history].reverse().map((point, index, list) => (
                <View key={point.month}>
                  <View style={styles.line}>
                    <Text variant="callout" color="inkSecondary">
                      {formatMonth(point.month)}
                    </Text>
                    <Text variant="callout">{formatCop(point.amount)}</Text>
                  </View>
                  {index < list.length - 1 ? <Divider /> : null}
                </View>
              ))}
            </View>

            <View style={styles.group}>
              <Overline>Por parqueadero</Overline>
              {(listings.data ?? []).map((listing, index, list) => (
                <View key={listing.id}>
                  <View style={styles.line}>
                    <View style={styles.lineBody}>
                      <Text variant="callout" numberOfLines={1}>
                        {listing.parking.name}
                      </Text>
                      <Text variant="caption" color="inkTertiary">
                        {listing.monthBookings}{' '}
                        {listing.monthBookings === 1 ? 'reserva' : 'reservas'} este mes
                      </Text>
                    </View>
                    <Text variant="callout">{formatCop(listing.monthEarnings)}</Text>
                  </View>
                  {index < list.length - 1 ? <Divider /> : null}
                </View>
              ))}
            </View>

            <View style={styles.payout}>
              <Text variant="subhead" color="inkSecondary">
                Por recibir
              </Text>
              <Text variant="title3">{formatCop(summary.data.pendingPayout)}</Text>
              <Text variant="caption" color="inkTertiary">
                Se transfiere el día 5 de cada mes a tu cuenta registrada.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
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
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxxl,
    gap: space.xl,
  },
  card: {
    gap: space.base,
    paddingVertical: space.lg,
  },
  group: {
    gap: space.md,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.base,
    paddingVertical: space.sm,
  },
  lineBody: {
    flex: 1,
    gap: 1,
  },
  payout: {
    gap: space.xs,
  },
});
