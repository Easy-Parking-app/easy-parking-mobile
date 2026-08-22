import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Screen, StickyBar } from '@/components/ui/Screen';
import { Overline, Text } from '@/components/ui/Text';
import { featureCatalog, featureOrder, kindCatalog, kindOrder } from '@/constants/catalog';
import { space } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { countParkings } from '@/services/parkings';
import { countActiveFilters, useSearchStore } from '@/store/useSearchStore';
import { useSessionStore } from '@/store/useSessionStore';
import { formatCop, formatDistance } from '@/utils/format';

const PRICE_STEPS = [4000, 6000, 8000] as const;
const DISTANCE_STEPS = [500, 1000, 2000] as const;

const SORTS = [
  { value: 'distancia', label: 'Más cercanos' },
  { value: 'precio', label: 'Más económicos' },
  { value: 'calificacion', label: 'Mejor calificados' },
] as const;

/**
 * Filters live in a modal with a live result count, so the driver always knows
 * what a tap costs them before dismissing.
 */
export default function FiltersScreen() {
  const router = useRouter();

  const location = useSessionStore((state) => state.location);
  const text = useSearchStore((state) => state.text);
  const near = useSearchStore((state) => state.near);
  const filters = useSearchStore((state) => state.filters);
  const setSort = useSearchStore((state) => state.setSort);
  const setMaxPrice = useSearchStore((state) => state.setMaxPrice);
  const setMaxDistance = useSearchStore((state) => state.setMaxDistance);
  const setOnlyAvailable = useSearchStore((state) => state.setOnlyAvailable);
  const toggleFeature = useSearchStore((state) => state.toggleFeature);
  const toggleKind = useSearchStore((state) => state.toggleKind);
  const resetFilters = useSearchStore((state) => state.resetFilters);

  const searchCenter = near ?? location;
  const { data: count, loading } = useAsync(
    () => countParkings({ text, near: searchCenter, filters }),
    [text, searchCenter.latitude, searchCenter.longitude, filters],
  );

  const active = countActiveFilters(filters);

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Text variant="title2">Filtros</Text>
        <IconButton
          icon={X}
          tone="filled"
          onPress={() => router.back()}
          accessibilityLabel="Cerrar los filtros"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Group title="Ordenar por">
          {SORTS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              selected={filters.sort === option.value}
              onPress={() => setSort(option.value)}
            />
          ))}
        </Group>

        <Group title="Precio por hora">
          {PRICE_STEPS.map((price) => (
            <Chip
              key={price}
              label={`Hasta ${formatCop(price)}`}
              selected={filters.maxPrice === price}
              onPress={() => setMaxPrice(filters.maxPrice === price ? null : price)}
            />
          ))}
          <Chip
            label="Sin límite"
            selected={filters.maxPrice === null}
            onPress={() => setMaxPrice(null)}
          />
        </Group>

        <Group title="Distancia">
          {DISTANCE_STEPS.map((distance) => (
            <Chip
              key={distance}
              label={formatDistance(distance)}
              selected={filters.maxDistance === distance}
              onPress={() => setMaxDistance(filters.maxDistance === distance ? null : distance)}
            />
          ))}
          <Chip
            label="Cualquiera"
            selected={filters.maxDistance === null}
            onPress={() => setMaxDistance(null)}
          />
        </Group>

        <Group title="Disponibilidad">
          <Chip
            label="Con cupos ahora"
            showCheck
            selected={filters.onlyAvailable}
            onPress={() => setOnlyAvailable(!filters.onlyAvailable)}
          />
        </Group>

        <Group title="Características">
          {featureOrder.map((key) => (
            <Chip
              key={key}
              label={featureCatalog[key].label}
              icon={featureCatalog[key].icon}
              selected={filters.features.includes(key)}
              onPress={() => toggleFeature(key)}
            />
          ))}
        </Group>

        <Group title="Tipo de parqueadero">
          {kindOrder.map((kind) => (
            <Chip
              key={kind}
              label={kindCatalog[kind].label}
              icon={kindCatalog[kind].icon}
              selected={filters.kinds.includes(kind)}
              onPress={() => toggleKind(kind)}
            />
          ))}
        </Group>
      </ScrollView>

      <StickyBar>
        <View style={styles.footer}>
          <Button
            label="Limpiar"
            variant="ghost"
            size="lg"
            fullWidth={false}
            onPress={resetFilters}
            disabled={active === 0}
          />
          <Button
            label={
              loading
                ? 'Buscando…'
                : count === 0
                  ? 'Sin resultados'
                  : count === 1
                    ? 'Ver 1 resultado'
                    : `Ver ${count ?? 0} resultados`
            }
            onPress={() => router.back()}
            disabled={count === 0}
            style={styles.footerCta}
          />
        </View>
      </StickyBar>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Overline>{title}</Overline>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingBottom: space.base,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
    gap: space.xl,
  },
  group: {
    gap: space.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  footerCta: {
    flex: 1,
  },
});
