import { StyleSheet, View } from 'react-native';

import { palette, radius, space } from '@/constants/theme';
import type { EarningsPoint } from '@/types';
import { formatMonth } from '@/utils/format';
import { Text } from '@/components/ui/Text';

export type EarningsChartProps = {
  data: EarningsPoint[];
  height?: number;
};

/**
 * Six bars, no axes, no gridlines. The shape of the trend is the information;
 * exact figures live in the summary above it.
 */
export function EarningsChart({ data, height = 96 }: EarningsChartProps) {
  const max = Math.max(...data.map((point) => point.amount), 1);

  return (
    <View style={styles.root} accessibilityLabel="Ingresos de los últimos meses">
      {data.map((point, index) => {
        const isLast = index === data.length - 1;
        return (
          <View key={point.month} style={styles.column}>
            <View style={[styles.track, { height }]}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(6, (point.amount / max) * height),
                    backgroundColor: isLast ? palette.ink : palette.surfaceAlt,
                  },
                ]}
              />
            </View>
            <Text variant="caption2" color={isLast ? 'ink' : 'inkTertiary'} align="center">
              {formatMonth(point.month).split(' ')[0]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: space.sm,
  },
  column: {
    flex: 1,
    gap: space.sm,
  },
  track: {
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: radius.xs,
    width: '100%',
  },
});
