import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  BadgeCheck,
  CircleParking,
  Clock,
  Footprints,
  Heart,
  MapPin,
  ScrollText,
  Share2,
} from 'lucide-react-native';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MapStatic } from '@/components/map';
import { FeatureGrid } from '@/components/parking/FeatureGrid';
import { PhotoGallery } from '@/components/parking/PhotoGallery';
import { ReviewRow } from '@/components/parking/ReviewRow';
import { AvailabilityBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Rating } from '@/components/ui/Rating';
import { Screen, StickyBar } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Overline, Text } from '@/components/ui/Text';
import { kindCatalog } from '@/constants/catalog';
import { palette, radius, space } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { fetchParking } from '@/services/parkings';
import { useFavoritesStore, useIsFavorite } from '@/store/useFavoritesStore';
import { useSessionStore } from '@/store/useSessionStore';
import type { OpeningHours } from '@/types';
import { availabilityDetail, availabilityLevel } from '@/utils/availability';
import {
  formatCop,
  formatDistance,
  formatMinutes,
  formatWalkingTime,
} from '@/utils/format';

const GALLERY_HEIGHT = 320;

/**
 * Parking detail.
 *
 * Photography first, then the four facts that decide a booking (price, rating,
 * distance, availability), then everything else in quiet grouped sections. One
 * CTA, pinned, always showing the price it commits to.
 */
export default function ParkingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const location = useSessionStore((state) => state.location);
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const favorite = useIsFavorite(id ?? '');

  const { data: parking, loading, error, reload } = useAsync(
    () => fetchParking(id ?? '', location),
    [id],
  );

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const compactHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [GALLERY_HEIGHT - 140, GALLERY_HEIGHT - 60], [0, 1], 'clamp'),
  }));

  if (loading) {
    return (
      <Screen edges={['top']}>
        <View style={styles.loading}>
          <Skeleton height={220} rounded={radius.md} />
          <Skeleton width="70%" height={28} />
          <Skeleton width="45%" height={16} />
          <Skeleton height={72} rounded={radius.sm} />
        </View>
      </Screen>
    );
  }

  if (error || !parking) {
    return (
      <Screen edges={['top']}>
        <View style={styles.headerFloating}>
          <IconButton
            icon={ArrowLeft}
            tone="filled"
            onPress={() => router.back()}
            accessibilityLabel="Volver"
          />
        </View>
        <EmptyState
          icon={CircleParking}
          tone="error"
          title="No pudimos abrir el parqueadero"
          message={error ?? 'Intenta de nuevo en un momento.'}
          actionLabel="Reintentar"
          onAction={reload}
        />
      </Screen>
    );
  }

  const level = availabilityLevel(parking);
  const soldOut = level === 'lleno';
  const kind = kindCatalog[parking.kind];

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: space.xxxl }}
      >
        <PhotoGallery
          photos={parking.photos}
          height={GALLERY_HEIGHT}
          width={width}
          label={parking.name}
        />

        <View style={styles.sheet}>
          <View style={styles.titleBlock}>
            <View style={styles.titleRow}>
              <Text variant="title1" style={styles.title}>
                {parking.name}
              </Text>
              {parking.verified ? (
                <BadgeCheck size={20} color={palette.accent} strokeWidth={2.25} />
              ) : null}
            </View>

            <View style={styles.metaRow}>
              <MapPin size={14} color={palette.inkTertiary} strokeWidth={2} />
              <Text variant="subhead" color="inkSecondary" style={styles.metaText}>
                {parking.address} · {parking.zone}
              </Text>
            </View>

            {parking.distanceMeters != null ? (
              <View style={styles.metaRow}>
                <Footprints size={14} color={palette.inkTertiary} strokeWidth={2} />
                <Text variant="subhead" color="inkSecondary">
                  {formatDistance(parking.distanceMeters)} · {formatWalkingTime(parking.distanceMeters)}
                </Text>
              </View>
            ) : null}

            <View style={styles.badgeRow}>
              <Rating value={parking.rating} count={parking.reviewCount} size="md" />
              <AvailabilityBadge level={level} />
            </View>
          </View>

          <FeatureGrid features={parking.features} />

          <Section title="Horario" icon={Clock}>
            <HoursList hours={parking.hours} />
          </Section>

          <Section title="Descripción">
            <Text variant="callout" color="inkSecondary">
              {parking.description}
            </Text>
            <View style={styles.kindRow}>
              <kind.icon size={16} color={palette.inkSecondary} strokeWidth={2} />
              <Text variant="footnote" color="inkSecondary">
                {kind.label} · {parking.spotsTotal}{' '}
                {parking.spotsTotal === 1 ? 'cupo' : 'cupos'} en total
              </Text>
            </View>
          </Section>

          <Section title="Reglas" icon={ScrollText}>
            <View style={styles.rules}>
              {parking.rules.map((rule) => (
                <View key={rule} style={styles.rule}>
                  <View style={styles.bullet} />
                  <Text variant="callout" color="inkSecondary" style={styles.ruleText}>
                    {rule}
                  </Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Ubicación" icon={MapPin}>
            <MapStatic height={150} />
            <Text variant="footnote" color="inkTertiary">
              La dirección exacta se comparte al confirmar la reserva.
            </Text>
          </Section>

          <Section title="Propietario">
            <View style={styles.owner}>
              <Avatar name={parking.owner.name} uri={parking.owner.avatarUrl} size={48} />
              <View style={styles.ownerBody}>
                <View style={styles.ownerNameRow}>
                  <Text variant="headline">{parking.owner.name}</Text>
                  {parking.owner.verified ? (
                    <BadgeCheck size={16} color={palette.accent} strokeWidth={2.25} />
                  ) : null}
                </View>
                <Text variant="footnote" color="inkTertiary">
                  Responde el {parking.owner.responseRate}% de los mensajes
                </Text>
              </View>
            </View>
          </Section>

          <Section title={`Reseñas · ${parking.reviewCount}`}>
            <View>
              {parking.reviews.map((review, index) => (
                <View key={review.id}>
                  <ReviewRow review={review} />
                  {index < parking.reviews.length - 1 ? <Divider /> : null}
                </View>
              ))}
            </View>
          </Section>
        </View>
      </Animated.ScrollView>

      {/* Compact header fades in once the gallery scrolls away. */}
      <Animated.View
        style={[styles.compactHeader, { paddingTop: insets.top }, compactHeaderStyle]}
        pointerEvents="none"
      >
        <Text variant="headline" numberOfLines={1} style={styles.compactTitle}>
          {parking.name}
        </Text>
      </Animated.View>

      <View style={[styles.headerFloating, { top: insets.top + space.sm }]} pointerEvents="box-none">
        <IconButton
          icon={ArrowLeft}
          tone="floating"
          onPress={() => router.back()}
          accessibilityLabel="Volver"
        />
        <View style={styles.headerActions}>
          <IconButton
            icon={Share2}
            tone="floating"
            onPress={() => undefined}
            accessibilityLabel="Compartir el parqueadero"
          />
          <IconButton
            icon={Heart}
            tone="floating"
            color={favorite ? palette.danger : palette.ink}
            onPress={() => toggleFavorite(parking.id)}
            accessibilityLabel={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          />
        </View>
      </View>

      <StickyBar>
        <View style={styles.cta}>
          <View>
            <View style={styles.priceRow}>
              <Text variant="title3">{formatCop(parking.pricePerHour)}</Text>
              <Text variant="footnote" color="inkTertiary">
                /hora
              </Text>
            </View>
            <Text variant="caption" color={soldOut ? 'danger' : 'inkSecondary'}>
              {availabilityDetail(parking)}
            </Text>
          </View>

          <Button
            label={soldOut ? 'Sin cupos' : 'Reservar'}
            onPress={() =>
              router.push({ pathname: '/reservar/[id]', params: { id: parking.id } })
            }
            disabled={soldOut}
            fullWidth={false}
            style={styles.ctaButton}
          />
        </View>
      </StickyBar>
    </View>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: typeof Clock;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {Icon ? <Icon size={14} color={palette.inkTertiary} strokeWidth={2} /> : null}
        <Overline>{title}</Overline>
      </View>
      {children}
    </View>
  );
}

const DAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function HoursList({ hours }: { hours: OpeningHours[] }) {
  const today = new Date().getDay();
  // Collapse to a single line when every day shares the same window.
  const uniform = hours.every(
    (entry) => entry.opensAt === hours[0]?.opensAt && entry.closesAt === hours[0]?.closesAt,
  );

  if (uniform && hours[0]) {
    return (
      <Text variant="callout" color="inkSecondary">
        Todos los días · {formatMinutes(hours[0].opensAt)} a {formatMinutes(hours[0].closesAt)}
      </Text>
    );
  }

  return (
    <View style={styles.hours}>
      {hours.map((entry) => (
        <View key={entry.weekday} style={styles.hourRow}>
          <Text
            variant="callout"
            color={entry.weekday === today ? 'ink' : 'inkSecondary'}
            weight={entry.weekday === today ? '600' : '400'}
          >
            {DAY_LABELS[entry.weekday]}
          </Text>
          <Text variant="callout" color="inkSecondary">
            {formatMinutes(entry.opensAt)} – {formatMinutes(entry.closesAt)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  loading: {
    padding: space.lg,
    gap: space.base,
  },
  sheet: {
    marginTop: -space.xl,
    paddingTop: space.xl,
    paddingHorizontal: space.lg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: palette.bg,
    gap: space.xl,
  },
  titleBlock: {
    gap: space.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  title: {
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  metaText: {
    flexShrink: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginTop: space.xs,
  },
  section: {
    gap: space.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
  },
  hours: {
    gap: space.sm,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  rules: {
    gap: space.md,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: palette.inkTertiary,
    marginTop: 9,
  },
  ruleText: {
    flex: 1,
  },
  owner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  ownerBody: {
    flex: 1,
    gap: 2,
  },
  ownerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  headerFloating: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    top: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    gap: space.sm,
  },
  compactHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: space.md,
    paddingHorizontal: space.giant,
    backgroundColor: palette.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.hairline,
  },
  compactTitle: {
    textAlign: 'center',
    marginTop: space.md,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.base,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: space.xs,
  },
  ctaButton: {
    minWidth: 168,
  },
});
