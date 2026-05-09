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

/** Override in `app.json` extra.trustpayApiUrl when the inferred host is wrong. */
export const API_BASE =
  extra?.trustpayApiUrl?.trim() ||
  (__DEV__ ? `http://${inferDevApiHost()}:8787` : "http://localhost:8787");

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
