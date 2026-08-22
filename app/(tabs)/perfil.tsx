import { useRouter } from 'expo-router';
import {
  CalendarDays,
  CircleQuestionMark,
  Heart,
  LogOut,
  Settings,
  Store,
  Wallet,
} from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Divider } from '@/components/ui/Divider';
import { PressableScale } from '@/components/ui/PressableScale';
import { Row } from '@/components/ui/Row';
import { Screen } from '@/components/ui/Screen';
import { Overline, Text } from '@/components/ui/Text';
import { palette, radius, space } from '@/constants/theme';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useSessionStore } from '@/store/useSessionStore';
import { formatMonth } from '@/utils/format';

/**
 * Profile stays a profile: who you are, four places to go, and the door into
 * owner mode. Deliberately not a dashboard.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const user = useSessionStore((state) => state.user);
  const setMode = useSessionStore((state) => state.setMode);
  const favorites = useFavoritesStore((state) => state.ids.length);

  const openOwner = () => {
    setMode('propietario');
    router.push('/propietario');
  };

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Avatar name={user.name} uri={user.avatarUrl} size={64} />
          <View style={styles.headerBody}>
            <Text variant="title2">{user.name}</Text>
            <Text variant="subhead" color="inkTertiary">
              {user.email}
            </Text>
            <Text variant="caption" color="inkTertiary">
              En Easy Parking desde {formatMonth(user.memberSince)}
            </Text>
          </View>
        </View>

        <PressableScale
          onPress={openOwner}
          scaleTo={0.99}
          accessibilityRole="button"
          accessibilityLabel="Abrir el modo propietario"
          accessibilityHint="Publica y administra tus parqueaderos"
          style={styles.ownerCard}
        >
          <View style={styles.ownerGlyph}>
            <Store size={20} color={palette.inkInverse} strokeWidth={2} />
          </View>
          <View style={styles.ownerBody}>
            <Text variant="headline" color="inkInverse">
              {user.isOwner ? 'Modo propietario' : 'Publica tu parqueadero'}
            </Text>
            <Text variant="footnote" style={styles.ownerHint}>
              {user.isOwner
                ? 'Administra tus espacios, reservas e ingresos'
                : 'Gana dinero con el espacio que no usas'}
            </Text>
          </View>
        </PressableScale>

        <View style={styles.group}>
          <Overline style={styles.groupTitle}>Tu actividad</Overline>
          <Row
            icon={CalendarDays}
            label="Mis reservas"
            onPress={() => router.push('/(tabs)/reservas')}
          />
          <Divider inset={space.giant} />
          <Row
            icon={Heart}
            label="Favoritos"
            value={favorites > 0 ? String(favorites) : undefined}
            onPress={() => router.push('/(tabs)/favoritos')}
          />
        </View>

        <View style={styles.group}>
          <Overline style={styles.groupTitle}>Cuenta</Overline>
          <Row icon={Wallet} label="Métodos de pago" detail="Nequi · Visa •••• 4821" onPress={() => undefined} />
          <Divider inset={space.giant} />
          <Row icon={Settings} label="Configuración" onPress={() => undefined} />
          <Divider inset={space.giant} />
          <Row icon={CircleQuestionMark} label="Ayuda y soporte" onPress={() => undefined} />
        </View>

        <View style={styles.group}>
          <Row icon={LogOut} label="Cerrar sesión" destructive chevron={false} onPress={() => undefined} />
        </View>

        <Text variant="caption" color="inkTertiary" align="center" style={styles.version}>
          Easy Parking · versión 0.1.0
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: space.xxxl,
    gap: space.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.base,
    paddingHorizontal: space.lg,
    paddingTop: space.base,
  },
  headerBody: {
    flex: 1,
    gap: 2,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginHorizontal: space.lg,
    padding: space.base,
    borderRadius: radius.md,
    backgroundColor: palette.ink,
  },
  ownerGlyph: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerBody: {
    flex: 1,
    gap: 2,
  },
  ownerHint: {
    color: 'rgba(255,255,255,0.62)',
  },
  group: {
    gap: space.xs,
  },
  groupTitle: {
    paddingHorizontal: space.lg,
    marginBottom: space.xs,
  },
  version: {
    marginTop: space.sm,
  },
});
