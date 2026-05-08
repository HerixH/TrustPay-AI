import { Dimensions } from 'react-native';

/** Solana-inspired palette: deep violet base, brand purple + mint accents */
export const COLORS = {
  bg: '#0b0820',
  surface: '#15102a',
  surfaceRaised: '#1e1840',
  surfaceMuted: '#2a2150',
  line: '#3d2f6d',
  lineBright: '#5b4a9a',
  text: '#f5f3ff',
  textMuted: '#a5a0c8',
  textFaint: '#6b6594',
  borderSubtle: '#352866',
  /** Brand mint (Solana green) — used in gradients & tab chrome */
  accentTeal: '#14f195',
  /** Brand purple — fills, links, focus */
  accentBlue: '#9945ff',
  accentPurple: '#9945ff',
  accentMint: '#14f195',
  textOnGradient: '#ffffff',
  success: '#14f195',
  warn: '#eab308',
  danger: '#fb7185',
  live: '#c4b5fd',
  tabBar: '#120e24',
  glass: 'rgba(21, 16, 42, 0.94)',
  glassBorder: 'rgba(255,255,255,0.08)',
  mapLand: '#1a1535',
  mapRoad: 'rgba(153, 69, 255, 0.12)',
};

/** Solana-style CTA: purple → mint */
export const GRADIENT_CTA = ['#9945ff', '#14f195'] as const;

/** Risk index bars: violet base → mint highlight */
export const GRADIENT_BAR_RISK_INDEX = [
  '#1e1840',
  '#3d2f6d',
  '#6b21a8',
  '#9945ff',
  '#14f195',
] as const;

/** Decorative chrome — cool purple slate */
export const GRADIENT_RAINBOW = [
  '#f5f3ff',
  '#ddd6fe',
  '#c4b5fd',
  '#a78bfa',
  '#c4b5fd',
  '#f5f3ff',
] as const;

export const GRADIENT_CYBER = [
  '#ede9fe',
  '#ddd6fe',
  '#a78bfa',
  '#7c3aed',
  '#ddd6fe',
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
