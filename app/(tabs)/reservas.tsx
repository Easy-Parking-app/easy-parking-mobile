import { useRouter } from 'expo-router';
import { CalendarDays, CircleAlert } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { BookingRow } from '@/components/booking/BookingRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ParkingRowSkeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { palette, space } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { fetchBookings } from '@/services/bookings';
import type { Booking } from '@/types';

type Tab = 'proximas' | 'activas' | 'historial';

const SEGMENTS = [
  { value: 'proximas' as const, label: 'Próximas' },
  { value: 'activas' as const, label: 'Activas' },
  { value: 'historial' as const, label: 'Historial' },
];

const EMPTY_COPY: Record<Tab, { title: string; message: string }> = {
  proximas: {
    title: 'Nada agendado todavía',
    message: 'Cuando reserves un parqueadero aparecerá aquí, con su código y su horario.',
  },
  activas: {
    title: 'Sin reservas en curso',
    message: 'Aquí verás la reserva que estés usando en este momento.',
  },
  historial: {
    title: 'Tu historial está vacío',
    message: 'Las reservas completadas y canceladas se guardan aquí.',
  },
};

function belongsTo(booking: Booking, tab: Tab): boolean {
  if (tab === 'proximas') return booking.status === 'proxima';
  if (tab === 'activas') return booking.status === 'activa';
  return booking.status === 'completada' || booking.status === 'cancelada';
}

export default function BookingsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('proximas');

  const { data, loading, error, reload, refreshing } = useAsync(() => fetchBookings(), []);

  const items = useMemo(() => {
    const list = (data ?? []).filter((booking) => belongsTo(booking, tab));
    return tab === 'historial'
      ? list.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
      : list;
  }, [data, tab]);

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Text variant="display">Reservas</Text>
      </View>

      <View style={styles.segments}>
        <SegmentedControl segments={SEGMENTS} value={tab} onChange={setTab} />
      </View>

      <FlatList
        data={loading ? [] : items}
        keyExtractor={(booking) => booking.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={palette.inkTertiary} />
        }
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
              title="No pudimos cargar tus reservas"
              message={error}
              actionLabel="Reintentar"
              onAction={reload}
            />
          ) : (
            <EmptyState
              icon={CalendarDays}
              title={EMPTY_COPY[tab].title}
              message={EMPTY_COPY[tab].message}
              actionLabel={tab === 'proximas' ? 'Buscar parqueadero' : undefined}
              onAction={tab === 'proximas' ? () => router.push('/(tabs)') : undefined}
            />
          )
        }
        renderItem={({ item }) => (
          <BookingRow
            booking={item}
            onPress={() => router.push({ pathname: '/reserva/[id]', params: { id: item.id } })}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.base,
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
