import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Rect, Text as SvgText } from 'react-native-svg';

import { palette, space } from '@/constants/theme';
import { Text } from '@/components/ui/Text';

export type LogoProps = {
  size?: number;
  /** Renders the wordmark next to the glyph. */
  withWordmark?: boolean;
  tone?: 'ink' | 'inverse';
};

/**
 * The Easy Parking mark: a squared "P" with a single accent dot for the space
 * that just got taken. Deliberately geometric so it reads at 20pt in a header.
 */
export function Logo({ size = 32, withWordmark = false, tone = 'ink' }: LogoProps) {
  const background = tone === 'ink' ? palette.ink : palette.bg;
  const foreground = tone === 'ink' ? palette.inkInverse : palette.ink;

  return (
    <View style={styles.root}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Rect x={0} y={0} width={32} height={32} rx={9} fill={background} />
        <SvgText
          x={16}
          y={23}
          fill={foreground}
          fontSize={20}
          fontWeight="700"
          textAnchor="middle"
        >
          P
        </SvgText>
        <Circle cx={24.5} cy={24.5} r={3} fill={palette.accent} />
      </Svg>
      {withWordmark ? (
        <Text variant="headline" color={tone === 'ink' ? 'ink' : 'inkInverse'}>
          Easy Parking
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
});
