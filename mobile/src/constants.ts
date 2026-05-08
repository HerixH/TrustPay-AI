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

/** Point a physical device here via `app.json` extra.trustpayApiUrl (e.g. http://192.168.1.x:8787). */
export const API_BASE =
  extra?.trustpayApiUrl?.trim() ||
  (__DEV__ ? `http://${devHost}:8787` : "http://localhost:8787");

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
