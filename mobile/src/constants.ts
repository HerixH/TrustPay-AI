import Constants from "expo-constants";
import { Platform } from "react-native";

const extra = Constants.expoConfig?.extra as
  | {
      trustpayApiUrl?: string;
      solanaRpcUrl?: string;
      programId?: string;
    }
  | undefined;

const devHost = Platform.select({
  android: "10.0.2.2",
  ios: "localhost",
  default: "localhost",
});

/**
 * When using Expo Go on a real phone, Metro's host is your PC's LAN IP — use it for the API
 * so `localhost` (the phone itself) is never contacted.
 */
function inferDevApiHost(): string {
  const raw =
    Constants.expoConfig?.hostUri ??
    (Constants.manifest as { debuggerHost?: string } | undefined)?.debuggerHost;
  if (!raw) return devHost;
  const ip = raw.split(":")[0]?.trim();
  if (
    !ip ||
    ip === "localhost" ||
    ip === "127.0.0.1" ||
    ip === "[::1]"
  ) {
    return devHost;
  }
  return ip;
}

/**
 * Production / preview builds must set API origin at build time (EAS Secrets or env):
 * `EXPO_PUBLIC_TRUSTPAY_API_URL=https://your-api.example.com`
 * Optionally also set `app.json` → `extra.trustpayApiUrl`.
 */
function publicApiUrlFromEnv(): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const v = process.env.EXPO_PUBLIC_TRUSTPAY_API_URL?.trim();
  return v && v.length > 0 ? v : undefined;
}

/** Override in `app.json` extra, or via `EXPO_PUBLIC_TRUSTPAY_API_URL` for release builds. */
export const API_BASE =
  extra?.trustpayApiUrl?.trim() ||
  publicApiUrlFromEnv() ||
  (__DEV__ ? `http://${inferDevApiHost()}:8787` : "");

/** Public devnet RPC unless overridden in app.json `extra.solanaRpcUrl`. */
export const SOLANA_RPC_URL =
  extra?.solanaRpcUrl?.trim() || "https://api.devnet.solana.com";

/**
 * Must match deployed Anchor program + backend `TRUSTPAY_PROGRAM_ID`.
 * Override via app.json `extra.programId` after `anchor deploy`.
 */
export const TRUSTPAY_PROGRAM_ID_STR =
  extra?.programId?.trim() ||
  "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFDSn";

/** Mobile Wallet Adapter `authorize({ identity })` — shown in Phantom / other wallets. */
export const MWA_APP_IDENTITY = {
  name: "TrustPay AI",
  uri: "https://trustpay.ai",
} as const;

/** Wallet-standard chain id for Solana devnet (MWA 2.x). */
export const SOLANA_MWA_CHAIN = "solana:devnet" as const;
