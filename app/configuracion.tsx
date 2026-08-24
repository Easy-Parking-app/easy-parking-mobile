import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  CircleDollarSign,
  Clock,
  FileText,
  Globe,
  MapPin,
  Route,
  Shield,
  Trash2,
  Vibrate,
} from 'lucide-react-native';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { Divider } from '@/components/ui/Divider';
import { IconButton } from '@/components/ui/IconButton';
import { Row } from '@/components/ui/Row';
import { Screen } from '@/components/ui/Screen';
import { Toggle } from '@/components/ui/Toggle';
import { Overline, Text } from '@/components/ui/Text';
import { palette, radius, space } from '@/constants/theme';
import {
  navigationAppLabels,
  type LanguagePreference,
  useSettingsStore,
  type NavigationApp,
  type ReminderLead,
} from '@/store/useSettingsStore';

const REMINDER_OPTIONS: ReminderLead[] = [15, 30, 60];
const LANGUAGE_OPTIONS: LanguagePreference[] = ['auto', 'es', 'en'];

/** Cada idioma en su propio idioma: es lo que reconoce quien lo busca. */
const languageLabels: Record<LanguagePreference, string> = {
  auto: 'Automático',
  es: 'Español',
  en: 'English',
};

const NAVIGATION_OPTIONS: NavigationApp[] = ['google', 'waze', 'apple'];

/**
 * Configuración.
 *
 * Solo ajustes que hacen algo: la háptica se aplica a cada toque de la app, el
 * recordatorio y la app de navegación se usan en el detalle de la reserva. Nada
 * de interruptores decorativos.
 */
export default function SettingsScreen() {
  const router = useRouter();

  const haptics = useSettingsStore((state) => state.haptics);
  const notifyBookings = useSettingsStore((state) => state.notifyBookings);
  const notifyReminders = useSettingsStore((state) => state.notifyReminders);
  const notifyNews = useSettingsStore((state) => state.notifyNews);
  const reminderLead = useSettingsStore((state) => state.reminderLead);
  const navigationApp = useSettingsStore((state) => state.navigationApp);
  const language = useSettingsStore((state) => state.language);
  const useLocation = useSettingsStore((state) => state.useLocation);

  const setHaptics = useSettingsStore((state) => state.setHaptics);
  const setNotifyBookings = useSettingsStore((state) => state.setNotifyBookings);
  const setNotifyReminders = useSettingsStore((state) => state.setNotifyReminders);
  const setNotifyNews = useSettingsStore((state) => state.setNotifyNews);
  const setReminderLead = useSettingsStore((state) => state.setReminderLead);
  const setNavigationApp = useSettingsStore((state) => state.setNavigationApp);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const setUseLocation = useSettingsStore((state) => state.setUseLocation);
  const reset = useSettingsStore((state) => state.reset);

  const confirmDelete = () => {
    const message =
      'Se cancelarán tus reservas próximas y perderás tu historial. Esta acción no se puede deshacer.';

    if (Platform.OS === 'web') return;
    Alert.alert('Eliminar cuenta', message, [
      { text: 'Conservar mi cuenta', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => undefined },
    ]);
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon={ArrowLeft}
          tone="filled"
          onPress={() => router.back()}
          accessibilityLabel="Volver"
        />
        <Text variant="headline">Configuración</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Group title="Notificaciones">
          <SwitchRow
            icon={Bell}
            label="Estado de mis reservas"
            detail="Confirmaciones, cambios y cancelaciones"
            value={notifyBookings}
            onValueChange={setNotifyBookings}
          />
          <Divider inset={space.giant} />
          <SwitchRow
            icon={Clock}
            label="Recordatorio de entrada"
            detail="Un aviso antes de que empiece tu reserva"
            value={notifyReminders}
            onValueChange={setNotifyReminders}
          />

          {notifyReminders ? (
            <View style={styles.chips}>
              {REMINDER_OPTIONS.map((minutes) => (
                <Chip
                  key={minutes}
                  label={minutes === 60 ? '1 hora antes' : `${minutes} min antes`}
                  selected={reminderLead === minutes}
                  onPress={() => setReminderLead(minutes)}
                />
              ))}
            </View>
          ) : null}

          <Divider inset={space.giant} />
          <SwitchRow
            icon={CircleDollarSign}
            label="Novedades y promociones"
            detail="Descuentos y parqueaderos nuevos cerca de ti"
            value={notifyNews}
            onValueChange={setNotifyNews}
          />
        </Group>

        <Group title="Al llegar">
          <View style={styles.block}>
            <View style={styles.blockHeader}>
              <View style={styles.glyph}>
                <Route size={18} color={palette.inkSecondary} strokeWidth={2} />
              </View>
              <View style={styles.blockBody}>
                <Text variant="callout">Abrir indicaciones en</Text>
                <Text variant="footnote" color="inkTertiary">
                  La app que se usa desde el detalle de una reserva
                </Text>
              </View>
            </View>
            <View style={styles.chips}>
              {NAVIGATION_OPTIONS.map((app) => (
                <Chip
                  key={app}
                  label={navigationAppLabels[app]}
                  selected={navigationApp === app}
                  onPress={() => setNavigationApp(app)}
                />
              ))}
            </View>
          </View>
        </Group>

        <Group title="Preferencias">
          <SwitchRow
            icon={Vibrate}
            label="Vibración al tocar"
            detail="Respuesta háptica en botones y selecciones"
            value={haptics}
            onValueChange={setHaptics}
            silent
          />
          <Divider inset={space.giant} />
          <SwitchRow
            icon={MapPin}
            label="Usar mi ubicación"
            detail="Ordena los resultados por cercanía"
            value={useLocation}
            onValueChange={setUseLocation}
          />
          <Divider inset={space.giant} />
          <View style={styles.block}>
            <View style={styles.blockHeader}>
              <View style={styles.glyph}>
                <Globe size={18} color={palette.inkSecondary} strokeWidth={2} />
              </View>
              <View style={styles.blockBody}>
                <Text variant="callout">Idioma</Text>
                <Text variant="footnote" color="inkTertiary">
                  Automático sigue al idioma del teléfono
                </Text>
              </View>
            </View>
            <View style={styles.chips}>
              {LANGUAGE_OPTIONS.map((option) => (
                <Chip
                  key={option}
                  label={languageLabels[option]}
                  selected={language === option}
                  onPress={() => setLanguage(option)}
                />
              ))}
            </View>
          </View>
          <Divider inset={space.giant} />
          <Row icon={CircleDollarSign} label="Moneda" value="COP" chevron={false} />
        </Group>

        <Group title="Privacidad y legal">
          <Row icon={Shield} label="Política de privacidad" onPress={() => undefined} />
          <Divider inset={space.giant} />
          <Row icon={FileText} label="Términos y condiciones" onPress={() => undefined} />
        </Group>

        <Group title="Avanzado">
          <Row
            label="Restablecer configuración"
            detail="Vuelve todos los ajustes a sus valores por defecto"
            onPress={reset}
            chevron={false}
          />
          <Divider inset={space.base} />
          <Row
            icon={Trash2}
            label="Eliminar mi cuenta"
            destructive
            chevron={false}
            onPress={confirmDelete}
          />
        </Group>

        <Text variant="caption" color="inkTertiary" align="center" style={styles.version}>
          Easy Parking · versión 0.1.0
        </Text>
      </ScrollView>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Overline style={styles.groupTitle}>{title}</Overline>
      {children}
    </View>
  );
}

function SwitchRow({
  icon: Icon,
  label,
  detail,
  value,
  onValueChange,
  silent = false,
}: {
  icon: typeof Bell;
  label: string;
  detail?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  silent?: boolean;
}) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.glyph}>
        <Icon size={18} color={palette.inkSecondary} strokeWidth={2} />
      </View>
      <View style={styles.blockBody}>
        <Text variant="callout">{label}</Text>
        {detail ? (
          <Text variant="footnote" color="inkTertiary">
            {detail}
          </Text>
        ) : null}
      </View>
      <Toggle
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        silent={silent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    paddingBottom: space.xxxl,
    gap: space.xl,
  },
  group: {
    gap: space.xs,
  },
  groupTitle: {
    paddingHorizontal: space.lg,
    marginBottom: space.xs,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 56,
    paddingVertical: space.md,
    paddingHorizontal: space.base,
  },
  glyph: {
    width: 32,
    height: 32,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
  },
  blockBody: {
    flex: 1,
    gap: 2,
  },
  block: {
    gap: space.md,
    paddingVertical: space.md,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.base,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    paddingHorizontal: space.base,
    paddingBottom: space.sm,
  },
  version: {
    marginTop: space.sm,
  },
});
