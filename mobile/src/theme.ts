import { Dimensions } from 'react-native';

export const COLORS = {
  bg: '#121212',
  surface: '#1E1E1E',
  surfaceRaised: '#252525',
  surfaceMuted: '#2C2C2E',
  line: '#2d2d30',
  lineBright: '#3f3f46',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  textFaint: '#71717a',
  borderSubtle: '#333336',
  /** Primary CTA accent (teal → blue) */
  accentTeal: '#14b8a6',
  accentBlue: '#3b82f6',
  success: '#34d399',
  danger: '#f87171',
  live: '#d4d4d8',
  tabBar: '#1a1a1c',
  glass: 'rgba(30, 30, 30, 0.94)',
  glassBorder: 'rgba(255,255,255,0.08)',
  mapLand: '#2a2a2e',
  mapRoad: 'rgba(255,255,255,0.06)',
};

/** Teal → blue for primary actions (matches reference CTA) */
export const GRADIENT_CTA = ['#14b8a6', '#2563eb'] as const;

/** Risk index bars: dark base → bright cap (flat bottom, rounded top) */
export const GRADIENT_BAR_RISK_INDEX = [
  '#333333',
  '#525252',
  '#a3a3a3',
  '#f5f5f5',
  '#ffffff',
] as const;

/** Secondary chrome gradients */
export const GRADIENT_RAINBOW = [
  '#ffffff',
  '#e5e7eb',
  '#d4d4d8',
  '#a1a1aa',
  '#d4d4d8',
  '#ffffff',
] as const;

export const GRADIENT_CYBER = [
  '#f5f5f5',
  '#d4d4d8',
  '#a1a1aa',
  '#71717a',
  '#e5e7eb',
] as const;

export const windowWidth = Dimensions.get('window').width;

/** Shared spacing — use for aligned, consistent layouts */
export const LAYOUT = {
  screenPadding: 18,
  sectionGap: 22,
  blockGap: 14,
  cardRadius: 22,
  cardRadiusLarge: 26,
  cardPadding: 18,
  maxContentWidth: 520,
} as const;
