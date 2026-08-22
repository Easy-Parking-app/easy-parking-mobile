import { useRouter } from 'expo-router';
import { ArrowLeft, Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import {
  CapacityStep,
  FeaturesStep,
  HoursStep,
  InfoStep,
  LocationStep,
  PhotosStep,
  PriceStep,
  ReviewStep,
} from '@/components/owner/PublishSteps';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Screen, StickyBar } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { motion, palette, radius, space } from '@/constants/theme';
import { publishListing } from '@/services/owner';
import {
  publishSteps,
  stepTitles,
  useListingDraftStore,
  type PublishStep,
} from '@/store/useListingDraftStore';

const STEP_CONTENT: Record<PublishStep, () => React.JSX.Element> = {
  fotos: PhotosStep,
  ubicacion: LocationStep,
  informacion: InfoStep,
  caracteristicas: FeaturesStep,
  precio: PriceStep,
  horarios: HoursStep,
  disponibilidad: CapacityStep,
  revision: ReviewStep,
};

/**
 * Publishing wizard.
 *
 * One decision per screen, a progress bar that actually maps to the steps, and
 * a Continue button that is disabled until the step is answered — so nobody
 * reaches the end and discovers a missing field.
 */
export default function PublishScreen() {
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const step = useListingDraftStore((state) => state.step);
  const next = useListingDraftStore((state) => state.next);
  const back = useListingDraftStore((state) => state.back);
  const canContinue = useListingDraftStore((state) => state.canContinue);
  const draft = useListingDraftStore((state) => state.draft);
  const reset = useListingDraftStore((state) => state.reset);

  const key = publishSteps[step] ?? 'fotos';
  const meta = stepTitles[key];
  const Content = STEP_CONTENT[key];
  const isLast = step === publishSteps.length - 1;
  const ready = canContinue();

  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${((step + 1) / publishSteps.length) * 100}%`, {
      duration: motion.duration.slow,
    }),
  }));

  const publish = async () => {
    setPublishing(true);
    setFailure(null);
    try {
      await publishListing(draft);
      setDone(true);
    } catch (error) {
      setFailure(error instanceof Error ? error.message : 'No pudimos publicar el parqueadero.');
    } finally {
      setPublishing(false);
    }
  };

  if (done) {
    return (
      <Screen edges={['top', 'bottom']}>
        <EmptyState
          icon={Check}
          title="Tu parqueadero quedó enviado"
          message="Lo revisaremos y te avisaremos cuando esté publicado. Suele tomar menos de 24 horas."
          actionLabel="Volver al inicio"
          onAction={() => {
            reset();
            router.back();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        {step === 0 ? (
          <IconButton
            icon={X}
            tone="filled"
            onPress={() => {
              reset();
              router.back();
            }}
            accessibilityLabel="Salir sin publicar"
          />
        ) : (
          <IconButton
            icon={ArrowLeft}
            tone="filled"
            onPress={back}
            accessibilityLabel="Paso anterior"
          />
        )}
        <Text variant="footnote" color="inkTertiary">
          Paso {step + 1} de {publishSteps.length}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, progressStyle]} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            key={key}
            entering={FadeIn.duration(motion.duration.base)}
            exiting={FadeOut.duration(motion.duration.instant)}
            style={styles.stepBody}
          >
            <View style={styles.titleBlock}>
              <Text variant="title1">{meta.title}</Text>
              <Text variant="callout" color="inkSecondary">
                {meta.hint}
              </Text>
            </View>

            <Content />

            {failure ? (
              <Text variant="footnote" color="danger">
                {failure}
              </Text>
            ) : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <StickyBar>
        <Button
          label={isLast ? 'Publicar parqueadero' : 'Continuar'}
          onPress={isLast ? publish : next}
          disabled={!ready}
          loading={publishing}
        />
      </StickyBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
  progressTrack: {
    height: 3,
    marginHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceAlt,
    overflow: 'hidden',
  },
  progressBar: {
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: palette.ink,
  },
  content: {
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    paddingBottom: space.xxl,
  },
  stepBody: {
    gap: space.xl,
  },
  titleBlock: {
    gap: space.sm,
  },
});
