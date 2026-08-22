import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  CircleAlert,
  Clock,
  Info,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { MapStatic } from '@/components/map';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Row } from '@/components/ui/Row';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Surface } from '@/components/ui/Surface';
import { Overline, Text } from '@/components/ui/Text';
import { palette, radius, space } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { cancelBooking } from '@/services/bookings';
import { fetchBooking } from '@/services/bookings';
import type { BookingStatus } from '@/types';
import { formatCop, formatLongDate, formatMinutes, minutesOfDay } from '@/utils/format';

const statusTone: Record<BookingStatus, { label: string; fg: string; bg: string }> = {
  proxima: { label: 'Próxima', fg: palette.accent, bg: palette.accentSoft },
  activa: { label: 'En curso', fg: palette.available, bg: palette.availableSoft },
  completada: { label: 'Completada', fg: palette.inkSecondary, bg: palette.surface },
  cancelada: { label: 'Cancelada', fg: palette.danger, bg: palette.dangerSoft },
};

/** The screen a driver opens at the barrier: code first, everything else after. */
export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);

  const { data: booking, loading, error, reload } = useAsync(() => fetchBooking(id ?? ''), [id]);

  if (loading) {
    return (
      <Screen edges={['top']}>
        <Header onBack={() => router.back()} />
        <View style={styles.loading}>
          <Skeleton height={140} rounded={radius.md} />
          <Skeleton height={120} rounded={radius.md} />
          <Skeleton height={150} rounded={radius.md} />
        </View>
      </Screen>
    );
  }

  if (error || !booking) {
    return (
      <Screen edges={['top']}>
        <Header onBack={() => router.back()} />
        <EmptyState
          icon={CircleAlert}
          tone="error"
          title="No pudimos abrir la reserva"
          message={error ?? 'Intenta de nuevo en un momento.'}
          actionLabel="Reintentar"
          onAction={reload}
        />
      </Screen>
    );
  }

  const startsAt = new Date(booking.startsAt);
  const endsAt = new Date(booking.endsAt);
  const tone = statusTone[booking.status];
  const cancellable = booking.status === 'proxima';

  const askToCancel = () => {
    const run = async () => {
      setCancelling(true);
      try {
        await cancelBooking(booking.id);
        reload();
      } finally {
        setCancelling(false);
      }
    };

    if (Platform.OS === 'web') {
      void run();
      return;
    }

    Alert.alert(
      'Cancelar reserva',
      'Se liberará el cupo y te devolveremos el valor pagado.',
      [
        { text: 'Volver', style: 'cancel' },
        { text: 'Cancelar reserva', style: 'destructive', onPress: () => void run() },
      ],
    );
  };

  return (
    <Screen edges={['top']}>
      <Header onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <Badge label={tone.label} fg={tone.fg} bg={tone.bg} />
          <Text variant="title1">{booking.parking.name}</Text>
          <Text variant="subhead" color="inkSecondary">
            {booking.parking.address} · {booking.parking.zone}
          </Text>
        </View>

        <Surface elevation="hairline" style={styles.codeCard}>
          <Overline>Código de reserva</Overline>
          <Text variant="title1" style={styles.code}>
            {booking.code}
          </Text>
          <Text variant="footnote" color="inkTertiary" align="center">
            Preséntalo en la entrada del parqueadero
          </Text>
        </Surface>

        <View style={styles.group}>
          <Overline>Horario</Overline>
          <Line icon={Calendar} label={formatLongDate(startsAt)} />
          <Line
            icon={Clock}
            label={`${formatMinutes(minutesOfDay(startsAt))} – ${formatMinutes(minutesOfDay(endsAt))}`}
          />
        </View>

        <Divider />

        <View style={styles.group}>
          <Overline>Ubicación</Overline>
          <MapStatic height={150} />
          <Line icon={MapPin} label={booking.parking.address} />
        </View>

        <Divider />

        <View style={styles.group}>
          <Overline>Instrucciones</Overline>
          <View style={styles.notice}>
            <Info size={15} color={palette.inkSecondary} strokeWidth={2} />
            <Text variant="footnote" color="inkSecondary" style={styles.noticeText}>
              Al llegar, sube tres fotos desde la app: la entrada, tu vehículo y la placa. Así
              quedan protegidos tú y el propietario.
            </Text>
          </View>
        </View>

        <Divider />

        <View style={styles.group}>
          <Overline>Pago</Overline>
          <View style={styles.line}>
            <Text variant="subhead" color="inkSecondary">
              {booking.paymentMethod.label} · {booking.paymentMethod.detail}
            </Text>
            <Text variant="subhead">{formatCop(booking.price.total)}</Text>
          </View>
        </View>

        <Divider />

        <View style={styles.groupTight}>
          <Overline style={styles.groupTitle}>Contacto</Overline>
          <Row
            icon={Phone}
            label="Llamar al parqueadero"
            onPress={() => undefined}
            style={styles.row}
          />
          <Row
            icon={MessageCircle}
            label="Escribir al propietario"
            onPress={() => undefined}
            style={styles.row}
          />
        </View>

        {cancellable ? (
          <Button
            label="Cancelar reserva"
            variant="danger"
            size="md"
            loading={cancelling}
            onPress={askToCancel}
            style={styles.cancel}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <IconButton icon={ArrowLeft} tone="filled" onPress={onBack} accessibilityLabel="Volver" />
    </View>
  );
}

function Line({ icon: Icon, label }: { icon: typeof Clock; label: string }) {
  return (
    <View style={styles.iconLine}>
      <Icon size={16} color={palette.inkTertiary} strokeWidth={2} />
      <Text variant="callout" color="inkSecondary" style={styles.noticeText}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  loading: {
    padding: space.lg,
    gap: space.base,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxxl,
    gap: space.lg,
  },
  titleBlock: {
    gap: space.sm,
  },
  codeCard: {
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.lg,
  },
  code: {
    letterSpacing: 1.2,
  },
  group: {
    gap: space.md,
  },
  groupTight: {
    gap: space.xs,
  },
  groupTitle: {
    paddingHorizontal: space.sm,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.base,
  },
  iconLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
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
  row: {
    paddingHorizontal: space.sm,
  },
  cancel: {
    marginTop: space.sm,
  },
});
