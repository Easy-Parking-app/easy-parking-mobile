import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { paymentCatalog } from '@/constants/catalog';
import { palette, radius, space } from '@/constants/theme';
import type { PaymentMethod } from '@/types';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';

export type PaymentMethodPickerProps = {
  methods: PaymentMethod[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function PaymentMethodPicker({ methods, selectedId, onSelect }: PaymentMethodPickerProps) {
  return (
    <View style={styles.root} accessibilityRole="radiogroup">
      {methods.map((method) => {
        const entry = paymentCatalog[method.kind];
        const Icon = entry.icon;
        const selected = method.id === selectedId;

        return (
          <PressableScale
            key={method.id}
            onPress={() => onSelect(method.id)}
            scaleTo={0.99}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${method.label} ${method.detail}`}
            style={[
              styles.option,
              { borderColor: selected ? palette.ink : palette.hairline },
            ]}
          >
            <View style={styles.glyph}>
              <Icon size={18} color={palette.ink} strokeWidth={2} />
            </View>

            <View style={styles.body}>
              <Text variant="callout">{method.label}</Text>
              <Text variant="footnote" color="inkTertiary">
                {method.detail}
              </Text>
            </View>

            <View style={[styles.check, selected ? styles.checkOn : null]}>
              {selected ? <Check size={13} color={palette.inkInverse} strokeWidth={3} /> : null}
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 64,
    paddingHorizontal: space.base,
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: palette.bg,
  },
  glyph: {
    width: 36,
    height: 36,
    borderRadius: radius.xs,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 1,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: palette.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
});
