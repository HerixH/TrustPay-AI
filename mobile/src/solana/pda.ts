import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";

export function dealSeedFromHex(hex: string): Uint8Array {
  if (hex.length !== 16 || !/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error("deal_seed must be 16 hex characters");
  }
  return Uint8Array.from(Buffer.from(hex, "hex"));
}

export function escrowPda(
  programId: PublicKey,
  buyer: PublicKey,
  seller: PublicKey,
  dealSeed: Uint8Array,
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("escrow"),
      buyer.toBuffer(),
      seller.toBuffer(),
      Buffer.from(dealSeed),
    ],
    programId,
  );
  return pda;
}

export function vaultPda(programId: PublicKey, escrow: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), escrow.toBuffer()],
    programId,
  );
  return pda;
}
