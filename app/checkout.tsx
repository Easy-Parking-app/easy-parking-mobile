import { useRouter } from 'expo-router';
import { ArrowLeft, CircleAlert, Lock } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PaymentMethodPicker } from '@/components/booking/PaymentMethodPicker';
import { PriceSummary } from '@/components/booking/PriceSummary';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Screen, StickyBar } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Overline, Text } from '@/components/ui/Text';
import { palette, radius, space } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { createBooking, fetchPaymentMethods } from '@/services/bookings';
import { fetchParking } from '@/services/parkings';
import { useBookingStore } from '@/store/useBookingStore';
import {
  formatCop,
  formatLongDate,
  formatMinutes,
  fromIsoDateAndMinutes,
} from '@/utils/format';
import { isDayRateApplied, quote } from '@/utils/pricing';

/**
 * Checkout.
 *
 * Everything that was decided, restated in one column, then the payment method,
 * then one button. Nothing is collapsed and the total never moves.
 */
export default function CheckoutScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const parkingId = useBookingStore((state) => state.parkingId);
  const date = useBookingStore((state) => state.date);
  const startMinutes = useBookingStore((state) => state.startMinutes);
  const endMinutes = useBookingStore((state) => state.endMinutes);
  const paymentMethodId = useBookingStore((state) => state.paymentMethodId);
  const setPaymentMethod = useBookingStore((state) => state.setPaymentMethod);
  const confirm = useBookingStore((state) => state.confirm);

  const { data: parking, loading: loadingParking } = useAsync(
    () => fetchParking(parkingId ?? ''),
    [parkingId],
  );
  const { data: methods, loading: loadingMethods } = useAsync(() => fetchPaymentMethods(), []);

  useEffect(() => {
    if (!paymentMethodId && methods && methods.length > 0) {
      setPaymentMethod(methods[0]!.id);
    }
  }, [methods, paymentMethodId, setPaymentMethod]);

  const price = useMemo(
    () =>
      parking
        ? quote(parking, startMinutes, endMinutes)
        : { hours: 0, subtotal: 0, serviceFee: 0, total: 0 },
    [parking, startMinutes, endMinutes],
  );

  const loading = loadingParking || loadingMethods;

  if (loading) {
    return (
      <Screen edges={['top']}>
        <Header onBack={() => router.back()} />
        <View style={styles.loading}>
          <Skeleton height={120} rounded={radius.md} />
          <Skeleton height={180} rounded={radius.md} />
          <Skeleton height={140} rounded={radius.md} />
        </View>
      </Screen>
    );
  }

  if (!parking || !parkingId) {
    return (
      <Screen edges={['top']}>
        <Header onBack={() => router.back()} />
        <EmptyState
          icon={CircleAlert}
          tone="error"
          title="Falta elegir el horario"
          message="Vuelve al parqueadero y selecciona la fecha y la hora de tu reserva."
          actionLabel="Volver"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const submit = async () => {
    setSubmitting(true);
    setFailure(null);
    try {
      const booking = await createBooking({
        parkingId,
        date,
        startMinutes,
        endMinutes,
        paymentMethodId: paymentMethodId ?? undefined,
      });
      confirm(booking);
      router.replace('/confirmacion');
    } catch (error) {
      setFailure(error instanceof Error ? error.message : 'No pudimos confirmar la reserva.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen edges={['top']}>
      <Header onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="title1">Confirma tu reserva</Text>

        <View style={styles.group}>
          <Overline>Parqueadero</Overline>
          <Text variant="headline">{parking.name}</Text>
          <Text variant="subhead" color="inkSecondary">
            {parking.address} · {parking.zone}
          </Text>
        </View>

        <Divider />

        <View style={styles.group}>
          <Overline>Cuándo</Overline>
          <Line label="Fecha" value={formatLongDate(fromIsoDateAndMinutes(date, 0))} />
          <Line label="Entrada" value={formatMinutes(startMinutes)} />
          <Line label="Salida" value={formatMinutes(endMinutes)} />
        </View>

        <Divider />

        <View style={styles.group}>
          <Overline>Precio</Overline>
          <PriceSummary
            price={price}
            dayRateApplied={isDayRateApplied(parking, startMinutes, endMinutes)}
          />
        </View>

        <Divider />

        <View style={styles.group}>
          <Overline>Método de pago</Overline>
          <PaymentMethodPicker
            methods={methods ?? []}
            selectedId={paymentMethodId}
            onSelect={setPaymentMethod}
          />
        </View>

        <View style={styles.secure}>
          <Lock size={14} color={palette.inkTertiary} strokeWidth={2} />
          <Text variant="caption" color="inkTertiary" style={styles.secureText}>
            El cobro se realiza al confirmar. Puedes cancelar sin costo hasta una hora antes de la
            entrada.
          </Text>
        </View>

        {failure ? (
          <View style={styles.error} accessibilityLiveRegion="polite">
            <CircleAlert size={16} color={palette.danger} strokeWidth={2} />
            <Text variant="footnote" color="danger" style={styles.secureText}>
              {failure}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <StickyBar>
        <View style={styles.footer}>
          <View>
            <Text variant="caption" color="inkTertiary">
              Total a pagar
            </Text>
            <Text variant="title3">{formatCop(price.total)}</Text>
          </View>
          <Button
            label="Confirmar reserva"
            onPress={submit}
            loading={submitting}
            fullWidth={false}
            style={styles.footerCta}
          />
        </View>
      </StickyBar>
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

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.line}>
      <Text variant="subhead" color="inkSecondary">
        {label}
      </Text>
      <Text variant="subhead">{value}</Text>
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
    paddingBottom: space.xxl,
    gap: space.lg,
  },
  group: {
    gap: space.sm,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.base,
  },
  secure: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.sm,
    backgroundColor: palette.surface,
  },
  secureText: {
    flex: 1,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.sm,
    backgroundColor: palette.dangerSoft,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.base,
  },
  footerCta: {
    minWidth: 184,
  },
});
