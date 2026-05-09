import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const WEB_PREFIX = "trustpay_ss_";

/**
 * Cross-platform persistence: SecureStore on iOS/Android, localStorage on web
 * (SecureStore has no real web keystore in Expo Go web).
 */
export async function walletStorageGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage === "undefined") return null;
      return localStorage.getItem(WEB_PREFIX + key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function walletStorageSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof localStorage === "undefined") {
      throw new Error("localStorage is not available in this environment.");
    }
    localStorage.setItem(WEB_PREFIX + key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function walletStorageDelete(key: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(WEB_PREFIX + key);
      }
    } catch {
      /* best-effort */
    }
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
