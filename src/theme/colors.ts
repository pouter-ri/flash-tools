export interface Palette {
  bg: string;
  bgDeep: string;
  bgGradient1: string;
  bgGradient2: string;

  primary: string;
  primaryDim: string;
  primaryGlow: string;
  secondary: string;
  secondaryDim: string;
  secondaryGlow: string;
  accent: string;
  accentGlow: string;

  positive: string;
  positiveGlow: string;
  positiveBg: string;
  positiveSolid: string;
  negative: string;
  negativeGlow: string;
  negativeBg: string;
  negativeSolid: string;
  warning: string;
  warningGlow: string;

  text: string;
  textDim: string;
  textMuted: string;

  cardBg: string;
  cardBgSolid: string;
  cardBorder: string;
  cardBorderHover: string;

  glass: string;
  glassBorder: string;
  glassHeavy: string;
  glassMedium: string;

  gradPrimary: readonly [string, string];
  gradPositive: readonly [string, string];
  gradNegative: readonly [string, string];
  gradBg: readonly [string, string, string];
  gradCard: readonly [string, string];
  gradGlass: readonly [string, string];

  surfaceAlt: string;
  overlay: string;
  headerBg: string;
  divider: string;
  shadow: string;
  statusBar: 'light' | 'dark';
  onPrimary: string;
  danger: string;
  dangerBg: string;
}

export const DARK: Palette = {
  bg: '#06060a',
  bgDeep: '#040408',
  bgGradient1: '#0a0a12',
  bgGradient2: '#0e0e1a',

  primary: '#6366ff',
  primaryDim: '#4f46e5',
  primaryGlow: 'rgba(99, 102, 255, 0.18)',
  secondary: '#6366ff',
  secondaryDim: '#4f46e5',
  secondaryGlow: 'rgba(99, 102, 255, 0.12)',
  accent: '#00d1b7',
  accentGlow: 'rgba(0, 209, 183, 0.14)',

  positive: '#00d1b7',
  positiveGlow: 'rgba(0, 209, 183, 0.14)',
  positiveBg: 'rgba(0, 209, 183, 0.07)',
  positiveSolid: '#0ab69e',
  negative: '#ff3355',
  negativeGlow: 'rgba(255, 51, 85, 0.14)',
  negativeBg: 'rgba(255, 51, 85, 0.07)',
  negativeSolid: '#e11d48',
  warning: '#ffb020',
  warningGlow: 'rgba(255, 176, 32, 0.14)',

  text: '#fcfcff',
  textDim: '#d8d8e0',
  textMuted: '#9aa0b2',

  cardBg: 'rgba(17, 17, 22, 0.86)',
  cardBgSolid: '#111117',
  cardBorder: 'rgba(255, 255, 255, 0.055)',
  cardBorderHover: 'rgba(255, 255, 255, 0.09)',

  glass: 'rgba(255, 255, 255, 0.025)',
  glassBorder: 'rgba(255, 255, 255, 0.055)',
  glassHeavy: 'rgba(255, 255, 255, 0.045)',
  glassMedium: 'rgba(17, 17, 22, 0.72)',

  gradPrimary: ['#7a7cff', '#4f46e5'],
  gradPositive: ['#00d1b7', '#0ab69e'],
  gradNegative: ['#ff5a79', '#e11d48'],
  gradBg: ['#06060a', '#0a0a12', '#0e0e1a'],
  gradCard: ['rgba(18,18,22,0.92)', 'rgba(18,18,22,0.58)'],
  gradGlass: ['rgba(18,18,22,0.78)', 'rgba(18,18,22,0.44)'],

  surfaceAlt: 'rgba(255, 255, 255, 0.035)',
  overlay: 'rgba(0, 0, 0, 0.68)',
  headerBg: 'rgba(12, 12, 16, 0.82)',
  divider: 'rgba(255, 255, 255, 0.055)',
  shadow: '#000000',
  statusBar: 'light',
  onPrimary: '#ffffff',
  danger: '#ff3355',
  dangerBg: 'rgba(255, 51, 85, 0.07)',
};

export const LIGHT: Palette = {
  bg: '#f8f9fb',
  bgDeep: '#f2f3f7',
  bgGradient1: '#ffffff',
  bgGradient2: '#f6f7fb',

  primary: '#4f46e5',
  primaryDim: '#4338ca',
  primaryGlow: 'rgba(79, 70, 229, 0.09)',
  secondary: '#4f46e5',
  secondaryDim: '#4338ca',
  secondaryGlow: 'rgba(79, 70, 229, 0.07)',
  accent: '#0ab69e',
  accentGlow: 'rgba(10, 182, 158, 0.09)',

  positive: '#0ab69e',
  positiveGlow: 'rgba(10, 182, 158, 0.09)',
  positiveBg: 'rgba(10, 182, 158, 0.055)',
  positiveSolid: '#0a8a78',
  negative: '#e11d48',
  negativeGlow: 'rgba(225, 29, 72, 0.09)',
  negativeBg: 'rgba(225, 29, 72, 0.055)',
  negativeSolid: '#be123c',
  warning: '#d97706',
  warningGlow: 'rgba(217, 119, 6, 0.09)',

  text: '#08080a',
  textDim: '#52525b',
  textMuted: '#6b7280',

  cardBg: '#ffffff',
  cardBgSolid: '#ffffff',
  cardBorder: 'rgba(0, 0, 0, 0.045)',
  cardBorderHover: 'rgba(0, 0, 0, 0.075)',

  glass: 'rgba(255, 255, 255, 0.82)',
  glassBorder: 'rgba(0, 0, 0, 0.045)',
  glassHeavy: 'rgba(255, 255, 255, 0.94)',
  glassMedium: 'rgba(255, 255, 255, 0.86)',

  gradPrimary: ['#7a7cff', '#4f46e5'],
  gradPositive: ['#00d1b7', '#0ab69e'],
  gradNegative: ['#ff5a79', '#e11d48'],
  gradBg: ['#f8f9fb', '#fdfdfd', '#f6f7fb'],
  gradCard: ['#ffffff', '#ffffff'],
  gradGlass: ['rgba(255,255,255,0.98)', 'rgba(255,255,255,0.86)'],

  surfaceAlt: 'rgba(0, 0, 0, 0.018)',
  overlay: 'rgba(8, 8, 12, 0.26)',
  headerBg: 'rgba(255, 255, 255, 0.84)',
  divider: 'rgba(0, 0, 0, 0.045)',
  shadow: 'rgba(0, 0, 0, 0.05)',
  statusBar: 'dark',
  onPrimary: '#ffffff',
  danger: '#e11d48',
  dangerBg: 'rgba(225, 29, 72, 0.055)',
};

export const COLORS: Palette = { ...DARK } as Palette;

export function applyTheme(mode: 'dark' | 'light'): void {
  Object.assign(COLORS, mode === 'light' ? LIGHT : DARK);
}

export const FONTS = {
  display: 'System',
  body: 'System',
  mono: 'Menlo',
} as const;

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 18,
  xl: 28,
  xxl: 48,
} as const;

export const TYPOGRAPHY = {
  kicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase' },
  caption: { fontSize: 12, fontWeight: '600', letterSpacing: 0.15 },
  body: { fontSize: 15, fontWeight: '500', letterSpacing: -0.18 },
  heading: { fontSize: 17, fontWeight: '700', letterSpacing: -0.35 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  display: { fontSize: 44, fontWeight: '800', letterSpacing: -1.2 },
} as const;

export const ELEVATION = {
  none: {},
  e1: {
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  e2: {
    shadowColor: '#000000',
    shadowOpacity: 0.09,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  e3: {
    shadowColor: '#000000',
    shadowOpacity: 0.13,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
} as const;
