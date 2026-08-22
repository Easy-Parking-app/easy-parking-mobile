import { useRouter } from 'expo-router';
import { CircleAlert, Heart } from 'lucide-react-native';
import { FlatList, StyleSheet, View } from 'react-native';

import { ParkingRow } from '@/components/parking/ParkingRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { ParkingRowSkeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { palette, space } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { fetchParkings } from '@/services/parkings';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useSessionStore } from '@/store/useSessionStore';

export default function FavoritesScreen() {
  const router = useRouter();
  const ids = useFavoritesStore((state) => state.ids);
  const remove = useFavoritesStore((state) => state.remove);
  const location = useSessionStore((state) => state.location);

  const { data, loading, error, reload } = useAsync(
    () => fetchParkings(ids, location),
    [ids.join(','), location.latitude, location.longitude],
  );

  const parkings = data ?? [];

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Text variant="display">Favoritos</Text>
        {parkings.length > 0 ? (
          <Text variant="footnote" color="inkTertiary">
            {parkings.length === 1 ? '1 parqueadero guardado' : `${parkings.length} parqueaderos guardados`}
          </Text>
        ) : null}
      </View>

      <FlatList
        data={loading ? [] : parkings}
        keyExtractor={(parking) => parking.id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          loading && ids.length > 0 ? (
            <View>
              <ParkingRowSkeleton />
              <ParkingRowSkeleton />
            </View>
          ) : error ? (
            <EmptyState
              icon={CircleAlert}
              tone="error"
              title="No pudimos cargar tus favoritos"
              message={error}
              actionLabel="Reintentar"
              onAction={reload}
            />
          ) : (
            <EmptyState
              icon={Heart}
              title="Aún no guardas ninguno"
              message="Toca el corazón en un parqueadero para tenerlo a mano la próxima vez."
              actionLabel="Explorar el mapa"
              onAction={() => router.push('/(tabs)')}
            />
          )
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowBody}>
              <ParkingRow
                parking={item}
                onPress={() => router.push({ pathname: '/parqueadero/[id]', params: { id: item.id } })}
              />
            </View>
            <IconButton
              icon={Heart}
              color={palette.danger}
              onPress={() => remove(item.id)}
              accessibilityLabel={`Quitar ${item.name} de favoritos`}
            />
          </View>
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
    gap: 2,
  },
  content: {
    paddingHorizontal: space.md,
    paddingBottom: space.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBody: {
    flex: 1,
  },
});
