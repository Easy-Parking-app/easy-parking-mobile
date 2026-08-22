import { memo, useMemo } from 'react';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { palette, type as typeScale } from '@/constants/theme';

/**
 * A drawn stand-in for the real map tiles.
 *
 * It is intentionally abstract and desaturated: markers and the bottom sheet are
 * the content, the map is the ground. When a tile provider is wired in, only
 * `MapCanvas` changes — this file goes away.
 */

type Props = {
  width: number;
  height: number;
};

/** Deterministic pseudo-random so the city never re-shuffles between renders. */
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
}

const BLOCK = 62;
const AVENUE_EVERY = 4;

export const MapBackdrop = memo(function MapBackdrop({ width, height }: Props) {
  const { verticals, horizontals, parks, river, labels } = useMemo(() => {
    const random = seeded(20260822);

    const cols = Math.ceil(width / BLOCK) + 1;
    const rows = Math.ceil(height / BLOCK) + 1;

    const verticalLines = Array.from({ length: cols }, (_, index) => ({
      x: index * BLOCK + (index % 2 === 0 ? 0 : 14),
      major: index % AVENUE_EVERY === 0,
    }));

    const horizontalLines = Array.from({ length: rows }, (_, index) => ({
      y: index * BLOCK + (index % 3 === 0 ? 0 : 10),
      major: index % AVENUE_EVERY === 0,
    }));

    const parkRects = Array.from({ length: 5 }, () => {
      const w = BLOCK * (1 + Math.round(random() * 2));
      const h = BLOCK * (1 + Math.round(random()));
      return {
        x: Math.round(random() * (width - w)),
        y: Math.round(random() * (height - h)),
        width: w - 16,
        height: h - 16,
      };
    });

    // A soft diagonal standing in for the eastern hills / Avenida Circunvalar.
    const riverPath = `M ${width * 0.86} 0 C ${width * 0.72} ${height * 0.3}, ${width * 0.9} ${height * 0.62}, ${width * 0.74} ${height}`;

    const labelPoints = [
      { label: 'CHAPINERO', x: width * 0.22, y: height * 0.34 },
      { label: 'ZONA T', x: width * 0.55, y: height * 0.24 },
      { label: 'EL CHICÓ', x: width * 0.68, y: height * 0.46 },
      { label: 'TEUSAQUILLO', x: width * 0.2, y: height * 0.68 },
      { label: 'USAQUÉN', x: width * 0.78, y: height * 0.14 },
      { label: 'SALITRE', x: width * 0.12, y: height * 0.5 },
    ];

    return {
      verticals: verticalLines,
      horizontals: horizontalLines,
      parks: parkRects,
      river: riverPath,
      labels: labelPoints,
    };
  }, [width, height]);

  return (
    <Svg width={width} height={height} pointerEvents="none">
      <Rect x={0} y={0} width={width} height={height} fill={palette.mapLand} />

      {parks.map((park, index) => (
        <Rect
          key={`park-${index}`}
          x={park.x}
          y={park.y}
          width={park.width}
          height={park.height}
          rx={10}
          fill={palette.mapPark}
        />
      ))}

      <G>
        {horizontals.map((line, index) => (
          <Line
            key={`h-${index}`}
            x1={0}
            y1={line.y}
            x2={width}
            y2={line.y}
            stroke={line.major ? palette.mapRoad : palette.mapRoadMinor}
            strokeWidth={line.major ? 7 : 3.5}
            strokeLinecap="round"
          />
        ))}
        {verticals.map((line, index) => (
          <Line
            key={`v-${index}`}
            x1={line.x}
            y1={0}
            x2={line.x}
            y2={height}
            stroke={line.major ? palette.mapRoad : palette.mapRoadMinor}
            strokeWidth={line.major ? 7 : 3.5}
            strokeLinecap="round"
          />
        ))}
      </G>

      <Path d={river} stroke={palette.mapWater} strokeWidth={16} fill="none" strokeLinecap="round" />
      <Path
        d={`M 0 ${height * 0.2} C ${width * 0.35} ${height * 0.28}, ${width * 0.5} ${height * 0.1}, ${width} ${height * 0.18}`}
        stroke={palette.mapRoad}
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
      />

      {labels.map((point) => (
        <G key={point.label}>
          <Circle cx={point.x - 10} cy={point.y - 4} r={2} fill={palette.mapLabel} />
          <SvgText
            x={point.x}
            y={point.y}
            fill={palette.mapLabel}
            fontSize={typeScale.caption2.fontSize}
            fontWeight="600"
            letterSpacing={0.8}
          >
            {point.label}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
});
