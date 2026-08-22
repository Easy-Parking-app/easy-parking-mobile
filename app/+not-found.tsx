import { useRouter } from 'expo-router';
import { Compass } from 'lucide-react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <Screen edges={['top', 'bottom']}>
      <EmptyState
        icon={Compass}
        title="Esta pantalla no existe"
        message="El enlace que abriste no lleva a ninguna parte dentro de Easy Parking."
        actionLabel="Ir al mapa"
        onAction={() => router.replace('/(tabs)')}
      />
    </Screen>
  );
}
