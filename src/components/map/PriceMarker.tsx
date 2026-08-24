import { memo, useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

import { motion, palette, type as typeScale } from '@/constants/theme';
import { formatCop } from '@/utils/format';
import { PressableScale } from '@/components/ui/PressableScale';

/**
 * El marcador de precio, dibujado en SVG y no con vistas.
 *
 * Antes era una `View` con borde redondeado y un `<Text>` dentro. Sobre el mapa
 * nativo salía cortado —"$ 8..", y en el peor caso solo "$"— porque dentro de un
 * `<Marker>` de Android la vista se rasteriza a un bitmap y el ancho de la
 * píldora dependía de medir el texto con flexbox. Esa medición no es fiable
 * ahí: la primera pasada se hace sin el ancho correcto y nunca se rehace, así
 * que el texto se truncaba antes de llegar a pintarse.
 *
 * En SVG no hay nada que medir. El lienzo lleva ancho y alto explícitos desde el
 * primer instante, la silueta son coordenadas y el precio se centra con
 * `textAnchor`. Lo que se dibuja ya no depende de cómo Android decida medir.
 *
 * El ancho se calcula con `priceMarkerWidth`, que es la misma cuenta para las
 * dos superficies: el mapa real y el dibujado.
 */

/** Alto de la píldora. */
const PILL_HEIGHT = 30;
/** Alto del pico que baja hasta el punto exacto. */
const NOTCH_HEIGHT = 6;
const NOTCH_WIDTH = 11;

/** Alto total: de la cabeza de la píldora a la punta del pico. */
export const PRICE_MARKER_HEIGHT = PILL_HEIGHT + NOTCH_HEIGHT;

/**
 * Avances de la fuente del sistema en negrita a 12 px.
 *
 * Se calcula el ancho en vez de medirlo, por lo mismo que arriba. Los dígitos
 * de las fuentes de interfaz son tabulares —todos miden igual—, así que la
 * cuenta es exacta y no una aproximación.
 */
const DIGIT_WIDTH = 6.7;
const SEPARATOR_WIDTH = 3.4;
const PADDING_X = 13;
const MIN_WIDTH = 62;

const textWidth = (label: string) =>
  [...label].reduce(
    (total, char) =>
      total + (char === '.' || char === ',' || char === ' ' ? SEPARATOR_WIDTH : DIGIT_WIDTH),
    0,
  );

/**
 * Ancho del marcador para un precio.
 *
 * Lo exporta porque `MapGoogleView` necesita el número antes de renderizar,
 * para dimensionar el contenedor del `<Marker>`.
 */
export const priceMarkerWidth = (price: number) =>
  Math.max(MIN_WIDTH, Math.ceil(textWidth(formatCop(price)) + PADDING_X * 2));

/** Silueta completa —píldora y pico— como un solo contorno. */
function outline(width: number) {
  const inset = 0.5;
  const radius = (PILL_HEIGHT - inset * 2) / 2;
  const left = inset + radius;
  const right = width - inset - radius;
  const bottom = PILL_HEIGHT - inset;
  const center = width / 2;

  return [
    `M ${left} ${inset}`,
    `L ${right} ${inset}`,
    `A ${radius} ${radius} 0 0 1 ${right} ${bottom}`,
    `L ${center + NOTCH_WIDTH / 2} ${bottom}`,
    `L ${center} ${PRICE_MARKER_HEIGHT - inset}`,
    `L ${center - NOTCH_WIDTH / 2} ${bottom}`,
    `L ${left} ${bottom}`,
    `A ${radius} ${radius} 0 0 1 ${left} ${inset}`,
    'Z',
  ].join(' ');
}

export type PriceMarkerProps = {
  price: number;
  selected: boolean;
  /** Sin un solo cupo libre. */
  full?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
};

export const PriceMarker = memo(function PriceMarker({
  price,
  selected,
  full = false,
  onPress,
  accessibilityLabel,
}: PriceMarkerProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, motion.spring.snappy);
  }, [selected, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 + 0.1 * progress.value },
      { translateY: -4 * progress.value },
    ],
  }));

  /**
   * Tres estados.
   *
   * "Lleno" va en rojo y no en gris. Un gris sobre el mapa se lee como "está
   * apagada", que no dice nada; el rojo dice que no hay sitio, y lo dice sin
   * tener que leer el precio. Es el único color de alarma del sistema y este es
   * exactamente su caso: información que cambia la decisión.
   *
   * La selección gana al rojo cuando coinciden: al tocar, lo que importa es
   * cuál se está mirando, y el detalle que se abre debajo ya dice si está lleno.
   */
  const alert = full && !selected;
  const fill = selected ? palette.ink : alert ? palette.danger : palette.bg;
  const stroke = selected ? palette.ink : alert ? palette.danger : palette.hairline;
  const label = selected || alert ? palette.inkInverse : palette.ink;

  const width = priceMarkerWidth(price);

  return (
    <Animated.View style={animatedStyle} pointerEvents="box-none">
      <PressableScale
        onPress={onPress}
        haptic
        scaleTo={0.94}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected }}
      >
        <Svg
          width={width}
          height={PRICE_MARKER_HEIGHT}
          viewBox={`0 0 ${width} ${PRICE_MARKER_HEIGHT}`}
        >
          <Path d={outline(width)} fill={fill} stroke={stroke} strokeWidth={1} />
          <SvgText
            x={width / 2}
            // La línea base, no el centro: el centro óptico de una cifra queda
            // algo por encima de la mitad geométrica de la caja.
            y={PILL_HEIGHT / 2 + typeScale.caption.fontSize * 0.35}
            textAnchor="middle"
            fontSize={typeScale.caption.fontSize}
            fontWeight="700"
            fill={label}
          >
            {formatCop(price)}
          </SvgText>
        </Svg>
      </PressableScale>
    </Animated.View>
  );
});
