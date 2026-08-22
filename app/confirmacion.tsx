import { useRouter } from 'expo-router';
import { Calendar, Check, CircleAlert, Clock, Info, MapPin } from 'lucide-react-native';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen, StickyBar } from '@/components/ui/Screen';
import { Surface } from '@/components/ui/Surface';
import { Overline, Text } from '@/components/ui/Text';
import { motion, palette, radius, space } from '@/constants/theme';
import { useBookingStore } from '@/store/useBookingStore';
import { formatCop, formatLongDate, formatMinutes, minutesOfDay } from '@/utils/format';

/**
 * Confirmation.
 *
 * One short, quiet celebration — a mark that settles into place — and then the
 * only thing that matters at the barrier: the code.
 */
export default function ConfirmationScreen() {
  const router = useRouter();
  const booking = useBookingStore((state) => state.lastConfirmed);
  const reset = useBookingStore((state) => state.reset);

  const markScale = useSharedValue(0.4);
  const markOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.6);

  useEffect(() => {
    markOpacity.value = withTiming(1, { duration: motion.duration.base });
    markScale.value = withSpring(1, motion.spring.snappy);
    ringScale.value = withDelay(120, withSpring(1, motion.spring.gentle));
  }, [markOpacity, markScale, ringScale]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.5 * markOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  if (!booking) {
    return (
      <Screen edges={['top']}>
        <EmptyState
          icon={CircleAlert}
          title="No hay una reserva reciente"
          message="Cuando confirmes una reserva la verás aquí."
          actionLabel="Ir al mapa"
          onAction={() => router.replace('/(tabs)')}
        />
      </Screen>
    );
  }

  const startsAt = new Date(booking.startsAt);
  const endsAt = new Date(booking.endsAt);

  const done = () => {
    reset();
    router.replace('/(tabs)');
  };

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.markWrap}>
            <Animated.View style={[styles.ring, ringStyle]} />
            <Animated.View style={[styles.mark, markStyle]}>
              <Check size={30} color={palette.inkInverse} strokeWidth={3} />
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(160).duration(320)} style={styles.heroText}>
            <Text variant="title1" align="center">
              Reserva confirmada
            </Text>
            <Text variant="callout" color="inkSecondary" align="center">
              Tu parqueadero está listo.
            </Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(240).duration(320)}>
          <Surface elevation="hairline" style={styles.codeCard}>
            <Overline>Código de reserva</Overline>
            <Text variant="display" style={styles.code}>
              {booking.code}
            </Text>
            <Text variant="footnote" color="inkTertiary" align="center">
              Preséntalo en la entrada
            </Text>
          </Surface>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(320)} style={styles.details}>
          <Detail icon={MapPin} label={booking.parking.name} detail={booking.parking.address} />
          <Detail
            icon={Calendar}
            label={formatLongDate(startsAt)}
            detail={`${formatMinutes(minutesOfDay(startsAt))} – ${formatMinutes(minutesOfDay(endsAt))}`}
          />
          <Detail
            icon={Clock}
            label={`Pagaste ${formatCop(booking.price.total)}`}
            detail={`${booking.paymentMethod.label} · ${booking.paymentMethod.detail}`}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(320)}>
          <View style={styles.notice}>
            <Info size={15} color={palette.inkSecondary} strokeWidth={2} />
            <Text variant="footnote" color="inkSecondary" style={styles.noticeText}>
              Llega hasta 10 minutos antes del inicio. Si necesitas cancelar, puedes hacerlo sin
              costo hasta una hora antes.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <StickyBar>
        <View style={styles.actions}>
          <Button
            label="Ver mi reserva"
            onPress={() => {
              reset();
              router.replace({ pathname: '/reserva/[id]', params: { id: booking.id } });
            }}
          />
          <Button label="Listo" variant="ghost" size="md" onPress={done} />
        </View>
      </StickyBar>
    </Screen>
  );
}

function Detail({
  icon: Icon,
  label,
  detail,
}: {
  icon: typeof MapPin;
  label: string;
  detail: string;
}) {
  return (
    <View style={styles.detail}>
      <View style={styles.detailGlyph}>
        <Icon size={17} color={palette.inkSecondary} strokeWidth={2} />
      </View>
      <View style={styles.detailBody}>
        <Text variant="callout" numberOfLines={1}>
          {label}
        </Text>
        <Text variant="footnote" color="inkTertiary" numberOfLines={1}>
          {detail}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.xxl,
    paddingBottom: space.xxl,
    gap: space.xl,
  },
  hero: {
    alignItems: 'center',
    gap: space.lg,
  },
  markWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: palette.availableSoft,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: palette.available,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    gap: space.xs,
  },
  codeCard: {
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.lg,
  },
  code: {
    letterSpacing: 1.2,
  },
  details: {
    gap: space.base,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  detailGlyph: {
    width: 36,
    height: 36,
    borderRadius: radius.xs,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBody: {
    flex: 1,
    gap: 1,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.sm,
    backgroundColor: palette.surface,
  },
  noticeText: {
    flex: 1,
  },
  actions: {
    gap: space.sm,
  },
});
