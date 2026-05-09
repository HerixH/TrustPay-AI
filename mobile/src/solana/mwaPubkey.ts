import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { toUint8Array } from "js-base64";

/** Decode an account address returned by Mobile Wallet Adapter `authorize`. */
export function publicKeyFromMwaAccountAddress(address: string): PublicKey {
  try {
    const bytes = toUint8Array(address);
    if (bytes.byteLength === 32) {
      return new PublicKey(bytes);
    }
  } catch {
    /* fall through */
  }
  return new PublicKey(bs58.decode(address));
}
