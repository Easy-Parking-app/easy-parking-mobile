import { useMemo, useRef } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { palette, radius, space } from '@/constants/theme';
import { formatWeekdayShort, startOfDay, toIsoDate } from '@/utils/format';
import { PressableScale } from '@/components/ui/PressableScale';
import { Text } from '@/components/ui/Text';

export type DateStripProps = {
  value: string;
  onChange: (isoDate: string) => void;
  /** How many days ahead the driver can book. */
  days?: number;
};

/**
 * A horizontal week rather than a modal date picker: choosing "today or
 * tomorrow" is one tap, which is what almost every reservation actually is.
 */
export function DateStrip({ value, onChange, days = 21 }: DateStripProps) {
  const listRef = useRef<FlatList<Date>>(null);

  const dates = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return date;
    });
  }, [days]);

  return (
    <FlatList
      ref={listRef}
      data={dates}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(date) => toIsoDate(date)}
      contentContainerStyle={styles.content}
      getItemLayout={(_, index) => ({ length: ITEM + space.sm, offset: (ITEM + space.sm) * index, index })}
      renderItem={({ item, index }) => {
        const iso = toIsoDate(item);
        const selected = iso === value;
        const label = index === 0 ? 'Hoy' : index === 1 ? 'Mañ' : formatWeekdayShort(item);

        return (
          <PressableScale
            onPress={() => onChange(iso)}
            haptic
            accessibilityRole="button"
            accessibilityLabel={`${label} ${item.getDate()}`}
            accessibilityState={{ selected }}
            style={[
              styles.day,
              {
                backgroundColor: selected ? palette.ink : palette.bg,
                borderColor: selected ? palette.ink : palette.hairline,
              },
            ]}
          >
            <Text
              variant="caption"
              style={{ color: selected ? palette.inkInverse : palette.inkTertiary }}
            >
              {label}
            </Text>
            <Text
              variant="headline"
              style={{ color: selected ? palette.inkInverse : palette.ink }}
            >
              {item.getDate()}
            </Text>
            <View
              style={[
                styles.marker,
                { backgroundColor: selected ? palette.inkInverse : palette.available },
              ]}
            />
          </PressableScale>
        );
      }}
    />
  );
}

const ITEM = 56;

const styles = StyleSheet.create({
  content: {
    gap: space.sm,
    paddingHorizontal: space.lg,
  },
  day: {
    width: ITEM,
    height: 74,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  marker: {
    width: 4,
    height: 4,
    borderRadius: radius.pill,
    marginTop: 2,
  },
});
