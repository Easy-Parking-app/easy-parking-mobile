/**
 * Easy Parking — design tokens.
 *
 * Single source of truth for colour, type, space, radius, elevation and motion.
 * Nothing in `app/` or `src/components/` may hardcode a visual value; if a value
 * is missing here, add it here first.
 *
 * Type scale follows the iOS Dynamic Type "Large" (default) metrics and the
 * SF Pro tracking table, so the app sits naturally on iOS while staying
 * legible on Android.
 */

import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/* ------------------------------------------------------------------ colour */

export const palette = {
  /** Page background. */
  bg: '#FFFFFF',
  /** Raised surfaces that still read as "page" (cards, sheets). */
  bgElevated: '#FFFFFF',
  /** Quiet fills: search pill, inactive chips, image placeholders. */
  surface: '#F4F5F7',
  /** One step deeper than `surface`, for nested fills. */
  surfaceAlt: '#ECEEF2',
  /** 1px separators. Never use as a border on interactive elements. */
  hairline: '#E3E6EC',

  /** Primary text and primary action background. */
  ink: '#0A0D12',
  /** Supporting text. */
  inkSecondary: '#5B6472',
  /** Metadata, placeholders, disabled labels. */
  inkTertiary: '#8C94A1',
  /** Text on top of `ink` / `accent`. */
  inkInverse: '#FFFFFF',

  /** Selection, active filters, links, focused map marker. Used sparingly. */
  accent: '#3D3BE8',
  accentSoft: '#EEEEFD',
  accentPressed: '#3230C4',

  /** "Disponible ahora". */
  available: '#12A150',
  availableSoft: '#E6F6EC',
  /** "Pocos cupos". */
  scarce: '#E8850C',
  scarceSoft: '#FDF2E3',
  /** Errors and destructive actions. */
  danger: '#D92D20',
  dangerSoft: '#FDECEA',

  /** Scrims behind modals and over photography. */
  overlay: 'rgba(10,13,18,0.45)',
  /** Gradient stop used to keep white controls legible over photos. */
  photoScrim: 'rgba(10,13,18,0.55)',

  /**
   * Mapa. Los usan el mapa dibujado y el estilo de Google, para que la ciudad
   * se vea igual en las dos superficies.
   *
   * La tierra es deliberadamente más oscura que el blanco de la app: es lo que
   * hace que las vías blancas se lean como vías y no como fondo, y lo que
   * separa las píldoras de precio del mapa. Un mapa casi blanco se ve limpio en
   * una captura y plano en la mano.
   */
  mapLand: '#E7ECF1',
  /** Manzanas y edificios: un escalón más oscuro, da textura sin ruido. */
  mapLandAlt: '#DDE4EB',
  mapWater: '#A5C6DE',
  mapPark: '#C8DFC2',
  mapRoad: '#FFFFFF',
  mapRoadMinor: '#F4F7FA',
  /** Vías principales en ámbar suave: jerarquía legible de un vistazo. */
  mapHighway: '#F4DCB0',
  mapLabel: '#6F7B89',
} as const;

export type ColorToken = keyof typeof palette;

/* ------------------------------------------------------------------- space */

/** 4pt base grid. Use tokens, not raw numbers. */
export const space = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  giant: 64,
} as const;

/** Horizontal page margin. Everything full-width aligns to this. */
export const screenPadding = space.lg;

/* ------------------------------------------------------------------ radius */

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

/* --------------------------------------------------------------- typography */

const fontFamily = Platform.select({
  ios: undefined, // San Francisco
  android: undefined, // Roboto
  default: undefined,
});

type TypeToken = {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
  letterSpacing: number;
};

/**
 * iOS Dynamic Type "Large" sizes with the matching SF Pro tracking values.
 * Note the positive tracking at display sizes — that is what SF actually does.
 */
export const type = {
  display: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: 0.4 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: 0.38 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.26 },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600', letterSpacing: -0.45 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.43 },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400', letterSpacing: -0.43 },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400', letterSpacing: -0.31 },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '500', letterSpacing: -0.23 },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '500', letterSpacing: -0.08 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 0 },
  caption2: { fontSize: 11, lineHeight: 13, fontWeight: '600', letterSpacing: 0.06 },
  /** All-caps section eyebrow. Pair with `inkTertiary`. */
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 0.6 },
} satisfies Record<string, TypeToken>;

export type TypeVariant = keyof typeof type;

export const fonts = { family: fontFamily } as const;

/* ------------------------------------------------------------------ shadow */

/**
 * Three levels, deliberately soft. Anything heavier reads as a template.
 * `sunken` is reserved for the sticky action bar, which sits *above* content.
 */
export const shadow = {
  none: {},
  raised: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0A0D12',
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 2 },
    default: { boxShadow: '0 4px 12px rgba(10,13,18,0.06)' } as ViewStyle,
  })!,
  floating: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0A0D12',
      shadowOpacity: 0.1,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
    },
    android: { elevation: 6 },
    default: { boxShadow: '0 8px 20px rgba(10,13,18,0.10)' } as ViewStyle,
  })!,
  sunken: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0A0D12',
      shadowOpacity: 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: -4 },
    },
    android: { elevation: 12 },
    default: { boxShadow: '0 -4px 16px rgba(10,13,18,0.08)' } as ViewStyle,
  })!,
} as const;

/* ------------------------------------------------------------------ motion */

export const motion = {
  duration: {
    /** State flips: chip on/off, press feedback. */
    instant: 140,
    /** Default for most transitions. */
    base: 200,
    /** Sheets, screen-level content swaps. */
    slow: 280,
    /** Celebration / confirmation only. */
    slowest: 380,
  },
  /** Standard ease-out; matches the feel of iOS content transitions. */
  easing: [0.22, 1, 0.36, 1] as const,
  spring: {
    /** Markers, chips, press states. */
    snappy: { damping: 18, stiffness: 260, mass: 0.9 },
    /** Sheets and large surfaces. */
    gentle: { damping: 22, stiffness: 180, mass: 1 },
  },
  /** Uniform press scale for tappable surfaces. */
  pressScale: 0.97,
} as const;

/* ------------------------------------------------------------------ layout */

export const layout = {
  screenPadding,
  /** HIG minimum interactive target. */
  hitSlopMin: 44,
  controlHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  hairlineWidth: 1,
  /** Bottom sheet resting heights, as a fraction of screen height. */
  sheetSnapPoints: ['22%', '55%', '92%'] as const,
} as const;

export const theme = {
  palette,
  space,
  radius,
  type,
  shadow,
  motion,
  layout,
  fonts,
} as const;

export type Theme = typeof theme;
