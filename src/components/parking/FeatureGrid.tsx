import { StyleSheet, View } from 'react-native';

import { featureCatalog } from '@/constants/catalog';
import { palette, radius, space } from '@/constants/theme';
import type { FeatureKey } from '@/types';
import { Text } from '@/components/ui/Text';

export type FeatureGridProps = {
  features: FeatureKey[];
  /** Caps the number shown; the rest collapse into a "+N" tile. */
  max?: number;
};

/** Four quiet tiles, icon over label. No colour — the icons carry the meaning. */
export function FeatureGrid({ features, max = 4 }: FeatureGridProps) {
  // Reserve a slot for the overflow tile so the row never exceeds `max` columns.
  const visible = features.slice(0, features.length > max ? max - 1 : max);
  const overflow = features.length - visible.length;

  return (
    <View style={styles.root}>
      {visible.map((key) => {
        const entry = featureCatalog[key];
        const Icon = entry.icon;
        return (
          <View key={key} style={styles.tile} accessibilityLabel={entry.label}>
            <Icon size={19} color={palette.ink} strokeWidth={1.75} />
            <Text variant="caption" color="inkSecondary" align="center" numberOfLines={2}>
              {entry.short}
            </Text>
          </View>
        );
      })}

      {overflow > 0 ? (
        <View style={styles.tile}>
          <Text variant="headline" color="inkSecondary">{`+${overflow}`}</Text>
          <Text variant="caption" color="inkTertiary">
            más
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: space.sm,
  },
  tile: {
    flex: 1,
    minHeight: 72,
    paddingVertical: space.md,
    paddingHorizontal: space.xs,
    borderRadius: radius.sm,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
});
