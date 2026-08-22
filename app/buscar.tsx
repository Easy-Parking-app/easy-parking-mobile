import { useRouter } from 'expo-router';
import { Clock, MapPin, Navigation, Search, X } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Overline, Text } from '@/components/ui/Text';
import { palette, radius, space } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { fetchSuggestions } from '@/services/parkings';
import { useSearchStore } from '@/store/useSearchStore';
import { useSessionStore } from '@/store/useSessionStore';
import type { Suggestion } from '@/types';

/**
 * Search is a full-screen task, not a bar that pushes the map around. Date and
 * time never appear here — they belong to the booking step, once a place is
 * chosen.
 */
export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const applySuggestion = useSearchStore((state) => state.applySuggestion);
  const clearLocation = useSearchStore((state) => state.clearLocation);
  const setLocation = useSessionStore((state) => state.setLocation);

  const { data, loading } = useAsync(() => fetchSuggestions(query), [query]);
  const suggestions = data ?? [];

  const grouped = {
    recientes: suggestions.filter((item) => item.kind === 'reciente'),
    zonas: suggestions.filter((item) => item.kind === 'zona'),
    lugares: suggestions.filter((item) => item.kind === 'lugar'),
  };

  const choose = (suggestion: Suggestion) => {
    applySuggestion(suggestion);
    setLocation(suggestion.coordinate);
    router.back();
  };

  const useMyLocation = () => {
    clearLocation();
    router.back();
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text variant="title2">Buscar</Text>
          <IconButton
            icon={X}
            tone="filled"
            onPress={() => router.back()}
            accessibilityLabel="Cerrar la búsqueda"
          />
        </View>

        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Dirección, zona o lugar"
          icon={Search}
          autoFocus
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Buscar parqueaderos"
        />
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.sections}>
            <PressableScale
              onPress={useMyLocation}
              scaleTo={0.99}
              accessibilityRole="button"
              accessibilityLabel="Buscar cerca de mi ubicación"
              style={styles.nearMe}
            >
              <View style={styles.nearMeGlyph}>
                <Navigation size={17} color={palette.accent} strokeWidth={2.25} />
              </View>
              <View style={styles.rowBody}>
                <Text variant="callout">Cerca de mí</Text>
                <Text variant="footnote" color="inkTertiary">
                  Usa tu ubicación actual
                </Text>
              </View>
            </PressableScale>

            {loading ? (
              <View style={styles.loading}>
                <Skeleton height={44} />
                <Skeleton height={44} />
                <Skeleton height={44} />
              </View>
            ) : null}

            {!loading && grouped.recientes.length > 0 ? (
              <Section title="Recientes">
                {grouped.recientes.map((item) => (
                  <SuggestionRow key={item.id} suggestion={item} icon={Clock} onPress={choose} />
                ))}
              </Section>
            ) : null}

            {!loading && grouped.lugares.length > 0 ? (
              <Section title="Parqueaderos">
                {grouped.lugares.map((item) => (
                  <SuggestionRow key={item.id} suggestion={item} icon={MapPin} onPress={choose} />
                ))}
              </Section>
            ) : null}

            {!loading && grouped.zonas.length > 0 ? (
              <Section title="Zonas de Bogotá">
                {grouped.zonas.map((item) => (
                  <SuggestionRow key={item.id} suggestion={item} icon={MapPin} onPress={choose} />
                ))}
              </Section>
            ) : null}

            {!loading && suggestions.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Nada por aquí"
                message={`No encontramos lugares para "${query}". Prueba con una zona o una dirección.`}
              />
            ) : null}
          </View>
        }
      />
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Overline style={styles.sectionTitle}>{title}</Overline>
      {children}
    </View>
  );
}

function SuggestionRow({
  suggestion,
  icon: Icon,
  onPress,
}: {
  suggestion: Suggestion;
  icon: typeof MapPin;
  onPress: (suggestion: Suggestion) => void;
}) {
  return (
    <>
      <PressableScale
        onPress={() => onPress(suggestion)}
        scaleTo={0.99}
        accessibilityRole="button"
        accessibilityLabel={suggestion.label}
        accessibilityHint={suggestion.detail}
        style={styles.row}
      >
        <View style={styles.rowGlyph}>
          <Icon size={17} color={palette.inkSecondary} strokeWidth={2} />
        </View>
        <View style={styles.rowBody}>
          <Text variant="callout" numberOfLines={1}>
            {suggestion.label}
          </Text>
          <Text variant="footnote" color="inkTertiary" numberOfLines={1}>
            {suggestion.detail}
          </Text>
        </View>
      </PressableScale>
      <Divider inset={space.huge} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: space.lg,
    paddingBottom: space.base,
    gap: space.base,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    paddingBottom: space.xxxl,
  },
  sections: {
    gap: space.xl,
  },
  nearMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginHorizontal: space.lg,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
    borderRadius: radius.sm,
    backgroundColor: palette.surface,
  },
  nearMeGlyph: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: palette.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    paddingHorizontal: space.lg,
    gap: space.md,
  },
  section: {
    gap: space.xs,
  },
  sectionTitle: {
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    minHeight: 56,
  },
  rowGlyph: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 1,
  },
});
