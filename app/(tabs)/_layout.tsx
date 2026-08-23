import { Tabs } from 'expo-router';
import { CalendarDays, Compass, Heart, User } from 'lucide-react-native';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, space, type as typeScale } from '@/constants/theme';

/** Alto que necesitan icono y etiqueta. Lo del sistema se suma aparte. */
const CONTENT_HEIGHT = 56;

/**
 * Four destinations, labelled, never disabled. The bar is a hairline over solid
 * white rather than a floating card — the map already provides the depth.
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  /**
   * La app corre en modo edge-to-edge (`edgeToEdgeEnabled` en app.json), o sea
   * que el contenido se dibuja por debajo de la barra de navegación del
   * sistema. Con un alto fijo, las pestañas quedaban justo debajo de los
   * botones de Android y se tocaba el de atrás queriendo tocar "Perfil".
   *
   * El alto tiene que ser contenido + inset, y el padding inferior igual al
   * inset, para que los iconos suban por encima de esa franja. El mínimo evita
   * que la barra quede pegada al borde en teléfonos sin barra de navegación.
   */
  const bottomInset = Math.max(insets.bottom, space.sm);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.ink,
        tabBarInactiveTintColor: palette.inkTertiary,
        tabBarStyle: [
          styles.bar,
          { height: CONTENT_HEIGHT + bottomInset, paddingBottom: bottomInset },
        ],
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        sceneStyle: { backgroundColor: palette.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, focused }) => (
            <Compass size={23} color={color} strokeWidth={focused ? 2.4 : 1.9} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color, focused }) => (
            <CalendarDays size={23} color={color} strokeWidth={focused ? 2.4 : 1.9} />
          ),
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color, focused }) => (
            <Heart size={23} color={color} strokeWidth={focused ? 2.4 : 1.9} />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <User size={23} color={color} strokeWidth={focused ? 2.4 : 1.9} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: palette.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.hairline,
    elevation: 0,
    paddingTop: space.sm,
  },
  label: {
    ...typeScale.caption2,
    marginTop: 2,
  },
  item: {
    paddingVertical: space.xxs,
  },
});
