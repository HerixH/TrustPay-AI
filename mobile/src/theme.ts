import { Dimensions } from 'react-native';

export const COLORS = {
  bg: '#050608',
  surface: '#0a0c10',
  surfaceRaised: '#12151c',
  line: '#1a1f2e',
  lineBright: '#2a2d3d',
  text: '#f4f4f5',
  textMuted: '#71717a',
  textFaint: '#52525b',
  borderSubtle: '#27272f',
  success: '#34d399',
  danger: '#fb7185',
  live: '#22d3ee',
  tabBar: '#08090c',
  glass: 'rgba(12, 14, 20, 0.78)',
  glassBorder: 'rgba(255,255,255,0.06)',
};

/** Rainbow accent stops for borders / CTAs */
export const GRADIENT_RAINBOW = [
  '#22d3ee',
  '#a78bfa',
  '#e879f9',
  '#fb7185',
  '#fb923c',
  '#facc15',
] as const;

export const GRADIENT_CYBER = [
  '#06b6d4',
  '#8b5cf6',
  '#d946ef',
  '#f43f5e',
  '#f97316',
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
