import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { space } from '@/constants/theme';
import type { PriceBreakdown } from '@/types';
import { formatCop, formatDuration } from '@/utils/format';
import { Divider } from '@/components/ui/Divider';
import { Text } from '@/components/ui/Text';

export type PriceSummaryProps = {
  price: PriceBreakdown;
  /** Shown when the owner's day rate beats the hourly total. */
  dayRateApplied?: boolean;
};

/** The total is never hidden and never smaller than the line items. */
export function PriceSummary({ price, dayRateApplied = false }: PriceSummaryProps) {
  return (
    <View style={styles.root}>
      <Line label="Duración" value={formatDuration(Math.round(price.hours * 60))} />
      <Line
        label={dayRateApplied ? 'Tarifa de día completo' : 'Tarifa'}
        value={formatCop(price.subtotal)}
      />
      <Line label="Servicio Easy Parking" value={formatCop(price.serviceFee)} />

      <Divider spacing={space.md} />

      <Animated.View key={price.total} entering={FadeIn.duration(160)} style={styles.totalRow}>
        <Text variant="headline">Total</Text>
        <Text variant="title3">{formatCop(price.total)}</Text>
      </Animated.View>

      <Text variant="caption" color="inkTertiary" style={styles.note}>
        Los valores incluyen IVA.
      </Text>
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
  root: {
    gap: space.md,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.base,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  note: {
    marginTop: -space.xs,
  },
});
