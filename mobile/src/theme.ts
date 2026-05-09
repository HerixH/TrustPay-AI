import { Dimensions } from "react-native";

/**
 * TrustPay · Solana-native visual system
 * Anchored on official Solana brand: #9945FF → #14F195 with deep space canvases.
 */
export const COLORS = {
  /** Near-black with cold violet lift */
  bg: "#030014",
  /** Subtle backdrop for layered screens */
  bgElevated: "#06051f",
  surface: "#0c0622",
  surfaceRaised: "#140b32",
  surfaceMuted: "#1a1240",
  surfaceHighlight: "#221a4a",

  line: "#3d2f7a",
  lineBright: "#6b4cc9",

  text: "#f8f7ff",
  textMuted: "#aca6d4",
  textFaint: "#6e6894",

  borderSubtle: "#2a1f55",
  /** Mint edge for “chain live” affordances */
  borderAccent: "rgba(20, 241, 149, 0.35)",

  /** Official Solana brand pair (solana.com) */
  solanaPurple: "#9945FF",
  solanaGreen: "#14F195",

  /** Aliases — same tokens, semantic names in UI */
  accentTeal: "#14F195",
  accentBlue: "#9945FF",
  accentPurple: "#9945FF",
  accentMint: "#14F195",

  /** Extra polish: electric cyan for focus / telemetry */
  accentCyan: "#38e8ff",
  accentLilac: "#c4b5fd",

  textOnGradient: "#ffffff",
  success: "#14F195",
  warn: "#fbbf24",
  danger: "#fb7185",

  live: "#c4b5fd",
  /** Tab bar: darker strip + luminous top edge */
  tabBar: "#020010",
  tabBarBorder: "rgba(153, 69, 255, 0.45)",

  glass: "rgba(12, 6, 34, 0.94)",
  glassBorder: "rgba(153, 69, 255, 0.2)",

  mapLand: "#120a2e",
  mapRoad: "rgba(20, 241, 149, 0.1)",
};

/** Primary CTA: Solana sweep (purple → violet mid → mint) */
export const GRADIENT_CTA = ["#9945FF", "#6d28d9", "#14F195"] as const;

export const GRADIENT_CTA_LOCATIONS = [0, 0.5, 1] as const;

/** Thin accent bars on cards / chrome */
export const GRADIENT_SOLANA_BAR = ["#9945FF", "#b794f6", "#14F195"] as const;

/** Logo ring — luminous purple–mint without muted pastels */
export const GRADIENT_LOGO_RING = [
  "#14F195",
  "#9945FF",
  "#38e8ff",
  "#9945FF",
  "#14F195",
] as const;

/** Risk / activity visualization */
export const GRADIENT_BAR_RISK_INDEX = [
  "#0c0622",
  "#4c1d95",
  "#7c3aed",
  "#9945FF",
  "#14F195",
] as const;

/** Soft chrome — still on-scale with brand violets */
export const GRADIENT_RAINBOW = [
  "#e9d5ff",
  "#c4b5fd",
  "#a78bfa",
  "#8b5cf6",
  "#c4b5fd",
  "#f5f3ff",
] as const;

export const GRADIENT_CYBER = [
  "#f5f3ff",
  "#ddd6fe",
  "#a78bfa",
  "#7c3aed",
  "#ddd6fe",
] as const;

export const windowWidth = Dimensions.get("window").width;

export const LAYOUT = {
  screenPadding: 18,
  sectionGap: 22,
  blockGap: 14,
  cardRadius: 22,
  cardRadiusLarge: 26,
  cardPadding: 18,
  maxContentWidth: 520,
} as const;
