import Constants from "expo-constants";
import { Platform } from "react-native";

import appJson from "../app.json";

type Extra = {
  trustpayApiUrl?: string;
  solanaRpcUrl?: string;
  programId?: string;
};

/**
 * `app.json` → `extra` is merged at bundle time so **Expo Web static export** still sees URLs even
 * when `Constants.expoConfig` is null (otherwise `API_BASE` is "" and fetch hits the SPA origin → HTML → JSON error).
 *
 * Native / dev client: `Constants.expoConfig.extra` overlays the same keys when present.
 */
const mergedExtra: Extra = {
  ...(appJson.expo?.extra as Extra | undefined),
  ...(Constants.expoConfig?.extra as Extra | undefined),
};

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
 * Production / preview: optional override at **build** time (EAS, Vercel):
 * `EXPO_PUBLIC_TRUSTPAY_API_URL=https://your-api.example.com`
 * Takes precedence over `app.json` extra for the API origin only.
 */
function publicApiUrlFromEnv(): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const v = process.env.EXPO_PUBLIC_TRUSTPAY_API_URL?.trim();
  return v && v.length > 0 ? v : undefined;
}

/** API origin: env override, then merged extra, then dev localhost. */
export const API_BASE =
  publicApiUrlFromEnv() ||
  mergedExtra.trustpayApiUrl?.trim() ||
  (__DEV__ ? `http://${inferDevApiHost()}:8787` : "");

/** Public devnet RPC unless overridden in app.json `extra.solanaRpcUrl`. */
export const SOLANA_RPC_URL =
  mergedExtra.solanaRpcUrl?.trim() || "https://api.devnet.solana.com";

/**
 * Must match deployed Anchor program + backend `TRUSTPAY_PROGRAM_ID`.
 * Override via app.json `extra.programId` after `anchor deploy`.
 */
export const TRUSTPAY_PROGRAM_ID_STR =
  mergedExtra.programId?.trim() ||
  "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFDSn";

/** Mobile Wallet Adapter `authorize({ identity })` — shown in Phantom / other wallets. */
export const MWA_APP_IDENTITY = {
  name: "TrustPay AI",
  uri: "https://trustpay.ai",
} as const;

/** Wallet-standard chain id for Solana devnet (MWA 2.x). */
export const SOLANA_MWA_CHAIN = "solana:devnet" as const;
