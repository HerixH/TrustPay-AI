import { Dimensions } from 'react-native';

export const COLORS = {
  bg: '#050505',
  surface: '#0d0d0f',
  surfaceRaised: '#161619',
  line: '#212125',
  lineBright: '#303036',
  text: '#f4f4f5',
  textMuted: '#71717a',
  textFaint: '#52525b',
  borderSubtle: '#2b2b31',
  success: '#f5f5f5',
  danger: '#a1a1aa',
  live: '#d4d4d8',
  tabBar: '#09090b',
  glass: 'rgba(12, 12, 14, 0.86)',
  glassBorder: 'rgba(255,255,255,0.06)',
};

/** Monochrome accent stops for borders / CTAs */
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
  screenPadding: 20,
  sectionGap: 20,
  blockGap: 12,
  cardRadius: 14,
  cardPadding: 16,
  maxContentWidth: 520,
} as const;
