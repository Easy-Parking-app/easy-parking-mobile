import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react-native';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, radius, space } from '@/constants/theme';
import { formatMinutes } from '@/utils/format';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';

export type TimeFieldProps = {
  label: string;
  value: number;
  onChange: (minutes: number) => void;
  /** Earliest selectable time, in minutes from midnight. */
  min?: number;
  max?: number;
  step?: number;
};

/**
 * Time picking as a light bottom list instead of a native wheel: the same
 * gesture on both platforms, and the whole day is scannable.
 */
export function TimeField({
  label,
  value,
  onChange,
  min = 0,
  max = 23 * 60 + 30,
  step = 30,
}: TimeFieldProps) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const options = useMemo(() => {
    const list: number[] = [];
    for (let minutes = min; minutes <= max; minutes += step) list.push(minutes);
    return list;
  }, [min, max, step]);

  const selectedIndex = Math.max(0, options.indexOf(value));

  return (
    <>
      <PressableScale
        onPress={() => setOpen(true)}
        scaleTo={0.99}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatMinutes(value)}`}
        accessibilityHint="Abre la lista de horas"
        style={styles.field}
      >
        <View style={styles.fieldBody}>
          <Text variant="caption" color="inkTertiary">
            {label}
          </Text>
          <Text variant="title3">{formatMinutes(value)}</Text>
        </View>
        <ChevronDown size={20} color={palette.inkTertiary} strokeWidth={2} />
      </PressableScale>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.scrim}
          onPress={() => setOpen(false)}
          accessibilityLabel="Cerrar"
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, space.base) }]}>
          <View style={styles.grabber} />
          <Text variant="headline" style={styles.sheetTitle}>
            {label}
          </Text>
          <FlatList
            data={options}
            keyExtractor={(minutes) => String(minutes)}
            initialScrollIndex={Math.max(0, selectedIndex - 2)}
            getItemLayout={(_, index) => ({ length: 52, offset: 52 * index, index })}
            style={styles.list}
            renderItem={({ item }) => {
              const selected = item === value;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.option, selected ? styles.optionSelected : null]}
                >
                  <Text variant="callout" weight={selected ? '600' : '400'}>
                    {formatMinutes(item)}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: space.base,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: palette.bg,
  },
  fieldBody: {
    gap: 2,
  },
  scrim: {
    flex: 1,
    backgroundColor: palette.overlay,
  },
  sheet: {
    backgroundColor: palette.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: space.md,
    maxHeight: '62%',
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceAlt,
    marginBottom: space.md,
  },
  sheetTitle: {
    paddingHorizontal: space.lg,
    paddingBottom: space.sm,
  },
  list: {
    paddingHorizontal: space.md,
  },
  option: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: space.base,
    borderRadius: radius.xs,
  },
  optionSelected: {
    backgroundColor: palette.surface,
  },
});
