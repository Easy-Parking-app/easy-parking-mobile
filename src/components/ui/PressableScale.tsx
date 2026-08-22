import * as Haptics from 'expo-haptics';
import { forwardRef, useCallback } from 'react';
import { Platform, Pressable, type PressableProps, type View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/constants/theme';
import { hapticsEnabled } from '@/store/useSettingsStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = PressableProps & {
  /** Scale applied while pressed. Defaults to the global token. */
  scaleTo?: number;
  /** Dim the element while pressed, in addition to scaling. */
  dim?: boolean;
  /** Fires a selection haptic on press-in (native only). */
  haptic?: boolean;
};

/**
 * The single press interaction in the app: a short spring down, a fade back.
 * Using one component everywhere is what makes taps feel consistent.
 */
export const PressableScale = forwardRef<View, PressableScaleProps>(function PressableScale(
  { scaleTo = motion.pressScale, dim = false, haptic = false, onPressIn, onPressOut, style, ...rest },
  ref,
) {
  const pressed = useSharedValue(0);

  // Only own `opacity` when dimming is requested — otherwise the animated style
  // would override the disabled opacity set by the caller.
  const animatedStyle = useAnimatedStyle(() =>
    dim
      ? {
          transform: [{ scale: withSpring(1 - (1 - scaleTo) * pressed.value, motion.spring.snappy) }],
          opacity: withTiming(1 - 0.35 * pressed.value, { duration: motion.duration.instant }),
        }
      : {
          transform: [{ scale: withSpring(1 - (1 - scaleTo) * pressed.value, motion.spring.snappy) }],
        },
  );

  const handlePressIn = useCallback<NonNullable<PressableProps['onPressIn']>>(
    (event) => {
      pressed.value = 1;
      if (haptic && Platform.OS !== 'web' && hapticsEnabled()) {
        void Haptics.selectionAsync();
      }
      onPressIn?.(event);
    },
    [haptic, onPressIn, pressed],
  );

  const handlePressOut = useCallback<NonNullable<PressableProps['onPressOut']>>(
    (event) => {
      pressed.value = 0;
      onPressOut?.(event);
    },
    [onPressOut, pressed],
  );

  return (
    <AnimatedPressable
      ref={ref}
      accessibilityRole="button"
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style as never, animatedStyle]}
    />
  );
});
