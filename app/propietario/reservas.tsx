import { useRouter } from 'expo-router';
import { ArrowLeft, CalendarDays, CircleAlert } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { BookingRow } from '@/components/booking/BookingRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ParkingRowSkeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { space } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { fetchOwnerBookings, guestNameFor } from '@/services/owner';

type Tab = 'proximas' | 'historial';

const SEGMENTS = [
  { value: 'proximas' as const, label: 'Próximas' },
  { value: 'historial' as const, label: 'Historial' },
];

/** The owner's side of the same reservation object the driver sees. */
export default function OwnerBookingsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('proximas');

  const { data, loading, error, reload } = useAsync(() => fetchOwnerBookings(), []);

  const items = useMemo(() => {
    const list = data ?? [];
    return tab === 'proximas'
      ? list.filter((booking) => booking.status === 'proxima' || booking.status === 'activa')
      : list.filter((booking) => booking.status === 'completada' || booking.status === 'cancelada');
  }, [data, tab]);

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon={ArrowLeft}
          tone="filled"
          onPress={() => router.back()}
          accessibilityLabel="Volver"
        />
        <Text variant="headline">Reservas recibidas</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.segments}>
        <SegmentedControl segments={SEGMENTS} value={tab} onChange={setTab} />
      </View>

      <FlatList
        data={loading ? [] : items}
        keyExtractor={(booking) => booking.id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          loading ? (
            <View>
              <ParkingRowSkeleton />
              <ParkingRowSkeleton />
            </View>
          ) : error ? (
            <EmptyState
              icon={CircleAlert}
              tone="error"
              title="No pudimos cargar las reservas"
              message={error}
              actionLabel="Reintentar"
              onAction={reload}
            />
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Sin reservas por ahora"
              message="Cuando un conductor reserve uno de tus espacios, lo verás aquí."
            />
          )
        }
        renderItem={({ item }) => (
          <BookingRow
            booking={item}
            guestName={guestNameFor(item.id)}
            onPress={() => router.push({ pathname: '/reserva/[id]', params: { id: item.id } })}
          />
        )}
      />
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
  segments: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  content: {
    paddingHorizontal: space.md,
    paddingBottom: space.xxl,
  },
});
