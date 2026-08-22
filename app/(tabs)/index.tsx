import BottomSheet, { BottomSheetFlatList, BottomSheetView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { LocateFixed, Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapView, type MapMarker } from '@/components/map';
import { ParkingPreviewCard } from '@/components/parking/ParkingPreviewCard';
import { ParkingRow } from '@/components/parking/ParkingRow';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { PressableScale } from '@/components/ui/PressableScale';
import { ParkingRowSkeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { palette, radius, shadow, space } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { searchParkings } from '@/services/parkings';
import { countActiveFilters, useSearchStore } from '@/store/useSearchStore';
import { useSessionStore } from '@/store/useSessionStore';

const SNAP_POINTS = ['30%', '62%', '92%'];

/**
 * Explorar — the home screen.
 *
 * The map owns the screen; the sheet owns the list. Selecting a marker collapses
 * the sheet into a single preview so the map stays readable, which is the whole
 * point of opening a parking app while driving.
 */
export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const sheetRef = useRef<BottomSheet>(null);
  const [sheetIndex, setSheetIndex] = useState(0);

  const location = useSessionStore((state) => state.location);
  const locating = useSessionStore((state) => state.locating);
  const locate = useSessionStore((state) => state.locate);

  const text = useSearchStore((state) => state.text);
  const near = useSearchStore((state) => state.near);
  const nearLabel = useSearchStore((state) => state.nearLabel);
  const filters = useSearchStore((state) => state.filters);
  const selectedId = useSearchStore((state) => state.selectedId);
  const select = useSearchStore((state) => state.select);
  const clearLocation = useSearchStore((state) => state.clearLocation);
  const setOnlyAvailable = useSearchStore((state) => state.setOnlyAvailable);
  const setSort = useSearchStore((state) => state.setSort);
  const setMaxPrice = useSearchStore((state) => state.setMaxPrice);

  const searchCenter = near ?? location;

  const { data, loading, error, reload } = useAsync(
    () => searchParkings({ text, near: searchCenter, filters }),
    [text, searchCenter.latitude, searchCenter.longitude, filters],
  );

  const parkings = data ?? [];
  const selected = parkings.find((parking) => parking.id === selectedId) ?? null;
  const activeFilters = countActiveFilters(filters);

  const markers = useMemo<MapMarker[]>(
    () =>
      parkings.map((parking) => ({
        id: parking.id,
        coordinate: parking.coordinate,
        price: parking.pricePerHour,
        unavailable: parking.spotsAvailable === 0,
        label: `${parking.name}, ${parking.pricePerHour} pesos por hora`,
      })),
    [parkings],
  );

  const handleSelect = useCallback(
    (id: string | null) => {
      select(id);
      sheetRef.current?.snapToIndex(id ? 0 : 1);
    },
    [select],
  );

  const openParking = useCallback(
    (id: string) => router.push({ pathname: '/parqueadero/[id]', params: { id } }),
    [router],
  );

  // Keeps markers inside the band between the floating controls and the sheet.
  const bottomInset = height * 0.34;
  const topInset = insets.top + 116;

  return (
    <View style={styles.root}>
      <MapView
        markers={markers}
        selectedId={selectedId}
        onSelectMarker={handleSelect}
        userLocation={location}
        focus={selected?.coordinate ?? near ?? null}
        bottomInset={bottomInset}
        topInset={topInset}
        style={StyleSheet.absoluteFill}
      />

      {/* Search + filters float above the map, never inside the sheet. */}
      <View style={[styles.controls, { paddingTop: insets.top + space.sm }]} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <PressableScale
            onPress={() => router.push('/buscar')}
            scaleTo={0.99}
            accessibilityRole="search"
            accessibilityLabel={nearLabel ? `Buscando en ${nearLabel}` : '¿A dónde quieres parquear?'}
            accessibilityHint="Abre la búsqueda"
            style={[styles.searchPill, shadow.floating]}
          >
            <Search size={19} color={palette.inkTertiary} strokeWidth={2} />
            <Text
              variant="callout"
              color={nearLabel ? 'ink' : 'inkTertiary'}
              numberOfLines={1}
              style={styles.searchLabel}
            >
              {nearLabel ?? '¿A dónde quieres parquear?'}
            </Text>
            {nearLabel ? (
              <IconButton
                icon={X}
                size={16}
                onPress={clearLocation}
                accessibilityLabel="Quitar la zona de búsqueda"
                style={styles.clear}
              />
            ) : null}
          </PressableScale>

          <IconButton
            icon={LocateFixed}
            tone="floating"
            onPress={() => {
              void locate();
              handleSelect(null);
            }}
            disabled={locating}
            accessibilityLabel="Centrar en mi ubicación"
            color={locating ? palette.inkTertiary : palette.ink}
            style={shadow.floating}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
        >
          <Chip
            label={activeFilters > 0 ? `Filtros · ${activeFilters}` : 'Filtros'}
            icon={SlidersHorizontal}
            selected={activeFilters > 0}
            onPress={() => router.push('/filtros')}
            style={shadow.raised}
          />
          <Chip
            label="Disponible ahora"
            selected={filters.onlyAvailable}
            onPress={() => setOnlyAvailable(!filters.onlyAvailable)}
            style={shadow.raised}
          />
          <Chip
            label="Más cercanos"
            selected={filters.sort === 'distancia'}
            onPress={() => setSort('distancia')}
            style={shadow.raised}
          />
          <Chip
            label="Hasta $ 6.000"
            selected={filters.maxPrice === 6000}
            onPress={() => setMaxPrice(filters.maxPrice === 6000 ? null : 6000)}
            style={shadow.raised}
          />
        </ScrollView>
      </View>

      <BottomSheet
        ref={sheetRef}
        index={0}
        snapPoints={SNAP_POINTS}
        onChange={setSheetIndex}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.sheetBackground}
        style={shadow.sunken}
        enableDynamicSizing={false}
      >
        {selected ? (
          <BottomSheetView style={styles.previewWrap}>
            <ParkingPreviewCard
              parking={selected}
              onOpen={() => openParking(selected.id)}
              onReserve={() => router.push({ pathname: '/reservar/[id]', params: { id: selected.id } })}
            />
          </BottomSheetView>
        ) : (
          <BottomSheetFlatList
            data={loading ? [] : parkings}
            keyExtractor={(parking) => parking.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + space.xxl }]}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text variant="title3">
                  {nearLabel ? `Cerca de ${nearLabel}` : 'Parqueaderos cercanos'}
                </Text>
                {!loading && !error ? (
                  <Text variant="footnote" color="inkTertiary">
                    {parkings.length === 1 ? '1 resultado' : `${parkings.length} resultados`}
                  </Text>
                ) : null}
              </View>
            }
            ListEmptyComponent={
              loading ? (
                <View>
                  <ParkingRowSkeleton />
                  <ParkingRowSkeleton />
                  <ParkingRowSkeleton />
                </View>
              ) : error ? (
                <EmptyState
                  icon={X}
                  tone="error"
                  title="No pudimos cargar el mapa"
                  message={error}
                  actionLabel="Reintentar"
                  onAction={reload}
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title="Sin resultados por aquí"
                  message="Prueba ampliando la distancia o quitando algún filtro."
                  actionLabel="Ver filtros"
                  onAction={() => router.push('/filtros')}
                />
              )
            }
            renderItem={({ item }) => (
              <ParkingRow parking={item} onPress={() => openParking(item.id)} />
            )}
            showsVerticalScrollIndicator={sheetIndex > 1}
          />
        )}
      </BottomSheet>

      {locating ? (
        <View style={[styles.locating, { top: insets.top + 132 }]} pointerEvents="none">
          <ActivityIndicator size="small" color={palette.ink} />
          <Text variant="caption" color="inkSecondary">
            Buscando tu ubicación…
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.mapLand,
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    height: 52,
    paddingLeft: space.base,
    paddingRight: space.sm,
    borderRadius: radius.pill,
    backgroundColor: palette.bg,
  },
  searchLabel: {
    flex: 1,
  },
  clear: {
    width: 32,
    height: 32,
  },
  chipsScroll: {
    marginHorizontal: -space.lg,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.xxs,
  },
  sheetBackground: {
    backgroundColor: palette.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  handle: {
    backgroundColor: palette.surfaceAlt,
    width: 36,
    height: 5,
  },
  listContent: {
    paddingHorizontal: space.md,
  },
  listHeader: {
    paddingHorizontal: space.sm,
    paddingBottom: space.sm,
    gap: 2,
  },
  previewWrap: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.xl,
  },
  locating: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.base,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: palette.bg,
    ...shadow.raised,
  },
});
