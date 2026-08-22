import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowLeft, CircleAlert, Plus, Star } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BookingRow } from '@/components/booking/BookingRow';
import { EarningsChart } from '@/components/owner/EarningsChart';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Surface } from '@/components/ui/Surface';
import { Overline, Text } from '@/components/ui/Text';
import { palette, radius, space } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import {
  fetchOwnerBookings,
  fetchOwnerListings,
  fetchOwnerSummary,
  guestNameFor,
} from '@/services/owner';
import { useSessionStore } from '@/store/useSessionStore';
import type { OwnerListingStatus } from '@/types';
import { formatCop, formatRating } from '@/utils/format';

const statusTone: Record<OwnerListingStatus, { label: string; fg: string; bg: string }> = {
  publicado: { label: 'Publicado', fg: palette.available, bg: palette.availableSoft },
  borrador: { label: 'Borrador', fg: palette.inkSecondary, bg: palette.surface },
  pausado: { label: 'Pausado', fg: palette.scarce, bg: palette.scarceSoft },
};

/**
 * Owner home.
 *
 * Three questions, in the order an owner actually asks them: how much did I
 * make, who is coming, and how are my spaces doing.
 */
export default function OwnerHomeScreen() {
  const router = useRouter();
  const setMode = useSessionStore((state) => state.setMode);

  const summary = useAsync(() => fetchOwnerSummary(), []);
  const listings = useAsync(() => fetchOwnerListings(), []);
  const bookings = useAsync(() => fetchOwnerBookings(), []);

  const upcoming = (bookings.data ?? []).filter((booking) => booking.status === 'proxima').slice(0, 3);

  const exitOwnerMode = () => {
    setMode('conductor');
    router.back();
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon={ArrowLeft}
          tone="filled"
          onPress={exitOwnerMode}
          accessibilityLabel="Salir del modo propietario"
        />
        <Text variant="headline">Propietario</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {summary.loading ? (
          <Skeleton height={200} rounded={radius.md} />
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
          <Surface elevation="hairline" style={styles.earnings}>
            <Overline>Ingresos de agosto</Overline>
            <Text variant="display">{formatCop(summary.data.monthEarnings)}</Text>

            <View style={styles.earningsMeta}>
              <Meta label="Por recibir" value={formatCop(summary.data.pendingPayout)} />
              <Meta label="Reservas" value={String(summary.data.bookingsThisMonth)} />
              <Meta
                label="Calificación"
                value={formatRating(summary.data.averageRating)}
                icon={<Star size={12} color={palette.ink} fill={palette.ink} strokeWidth={0} />}
              />
            </View>

            <EarningsChart data={summary.data.history} />

            <Button
              label="Ver detalle de ingresos"
              variant="secondary"
              size="md"
              onPress={() => router.push('/propietario/ingresos')}
            />
          </Surface>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Overline>Próximas reservas</Overline>
            <PressableScale
              onPress={() => router.push('/propietario/reservas')}
              accessibilityRole="button"
              accessibilityLabel="Ver todas las reservas"
            >
              <Text variant="footnote" color="accent">
                Ver todas
              </Text>
            </PressableScale>
          </View>

          {bookings.loading ? (
            <Skeleton height={84} rounded={radius.md} />
          ) : upcoming.length === 0 ? (
            <Text variant="subhead" color="inkTertiary">
              No tienes reservas próximas.
            </Text>
          ) : (
            upcoming.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                guestName={guestNameFor(booking.id)}
                onPress={() => router.push('/propietario/reservas')}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Overline>Mis parqueaderos</Overline>

          {listings.loading ? (
            <Skeleton height={96} rounded={radius.md} />
          ) : (
            (listings.data ?? []).map((listing) => {
              const tone = statusTone[listing.status];
              return (
                <PressableScale
                  key={listing.id}
                  scaleTo={0.99}
                  onPress={() =>
                    router.push({
                      pathname: '/parqueadero/[id]',
                      params: { id: listing.parking.id },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={listing.parking.name}
                  style={styles.listing}
                >
                  <Image
                    source={{ uri: listing.parking.photos[0] }}
                    style={styles.listingPhoto}
                    contentFit="cover"
                    transition={160}
                    accessibilityIgnoresInvertColors
                  />
                  <View style={styles.listingBody}>
                    <Text variant="headline" numberOfLines={1}>
                      {listing.parking.name}
                    </Text>
                    <Text variant="footnote" color="inkTertiary" numberOfLines={1}>
                      {listing.parking.zone} · {formatCop(listing.parking.pricePerHour)}/hora
                    </Text>
                    <Badge label={tone.label} fg={tone.fg} bg={tone.bg} style={styles.listingBadge} />
                  </View>
                  <View style={styles.listingStats}>
                    <Text variant="subhead">{formatCop(listing.monthEarnings)}</Text>
                    <Text variant="caption" color="inkTertiary">
                      {Math.round(listing.occupancyRate * 100)}% ocupación
                    </Text>
                  </View>
                </PressableScale>
              );
            })
          )}

          <Button
            label="Publicar un parqueadero"
            icon={Plus}
            onPress={() => router.push('/propietario/publicar')}
            style={styles.publish}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Meta({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <View style={styles.meta}>
      <Text variant="caption" color="inkTertiary">
        {label}
      </Text>
      <View style={styles.metaValue}>
        {icon}
        <Text variant="subhead" weight="600">
          {value}
        </Text>
      </View>
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
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxxl,
    gap: space.xl,
  },
  earnings: {
    gap: space.base,
    paddingVertical: space.lg,
  },
  earningsMeta: {
    flexDirection: 'row',
    gap: space.lg,
  },
  meta: {
    gap: 2,
  },
  metaValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  section: {
    gap: space.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.sm,
  },
  listingPhoto: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: palette.surface,
  },
  listingBody: {
    flex: 1,
    gap: 3,
  },
  listingBadge: {
    marginTop: space.xxs,
  },
  listingStats: {
    alignItems: 'flex-end',
    gap: 2,
  },
  publish: {
    marginTop: space.sm,
  },
});
