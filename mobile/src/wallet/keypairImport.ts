import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

/** Strip whitespace / newlines / BOM often copied from exports. */
function normalizePaste(raw: string): string {
  return raw
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/\s+/g, "");
}

/**
 * Build a keypair from Phantom-style base58, Solana CLI `keypair.json`, or raw bytes forms.
 */
export function keypairFromImport(raw: string): Keypair {
  const s = normalizePaste(raw);
  if (!s) {
    throw new Error("Paste is empty.");
  }

  // Solana CLI / file export: [1,2,3,...]
  if (s.startsWith("[")) {
    let arr: unknown;
    try {
      arr = JSON.parse(s);
    } catch {
      throw new Error(
        "Could not parse JSON. Paste the full keypair array from a Solana CLI JSON file.",
      );
    }
    if (!Array.isArray(arr) || arr.some((n) => typeof n !== "number")) {
      throw new Error(
        "Invalid keypair JSON: expected an array of numbers (Solana keypair file).",
      );
    }
    const u8 = Uint8Array.from(arr);
    if (u8.length === 64) {
      return Keypair.fromSecretKey(u8);
    }
    if (u8.length === 32) {
      return Keypair.fromSeed(u8);
    }
    throw new Error(
      `This key array has ${u8.length} bytes. Solana expects 32 (seed) or 64 (full secret).`,
    );
  }

  let decoded: Uint8Array;
  try {
    decoded = bs58.decode(s);
  } catch {
    throw new Error(
      "Not valid base58. Export the private key from your wallet (not the address), or paste a Solana keypair JSON array.",
    );
  }

  if (decoded.length === 64) {
    return Keypair.fromSecretKey(decoded);
  }

  // 32 bytes: either a seed or (often) someone pasted a *public key* / address by mistake.
  if (decoded.length === 32) {
    if (s.length <= 52) {
      throw new Error(
        "That decodes like a public address (32 bytes). You need the private key / secret — in Phantom: Settings → export private key (long base58), not the receive address.",
      );
    }
    return Keypair.fromSeed(decoded);
  }

  throw new Error(
    `Unrecognized key length (${decoded.length} bytes after base58). Use a full Phantom private key export or a Solana CLI keypair JSON file.`,
  );
}
