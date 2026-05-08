import { PublicKey } from "@solana/web3.js";
import { dealSeedFromHex, escrowPda, vaultPda } from "../pda";

/** Must match `backend` `solana_util::tests::escrow_and_vault_pda_match_known_fixture`. */
const FIXTURE_PROGRAM = "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFDSn";
const FIXTURE_BUYER = "So11111111111111111111111111111111111111112";
const FIXTURE_SELLER = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const EXPECT_ESCROW = "CmgGg7QKYPFutZAzZNzyFd32ktoBF54d4g66kt91hNCb";
const EXPECT_VAULT = "FXf3jukbDCRUjsjX1UZRSpi9tmjFaLwCzEWtuw4bSxYS";

describe("pda", () => {
  it("derivation matches Rust backend golden addresses", () => {
    const program = new PublicKey(FIXTURE_PROGRAM);
    const buyer = new PublicKey(FIXTURE_BUYER);
    const seller = new PublicKey(FIXTURE_SELLER);
    const seed = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);
    const escrow = escrowPda(program, buyer, seller, seed);
    const vault = vaultPda(program, escrow);
    expect(escrow.toBase58()).toBe(EXPECT_ESCROW);
    expect(vault.toBase58()).toBe(EXPECT_VAULT);
  });

  it("dealSeedFromHex parses 16-char hex", () => {
    const s = dealSeedFromHex("0102030405060708");
    expect(Array.from(s)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("dealSeedFromHex rejects bad input", () => {
    expect(() => dealSeedFromHex("00")).toThrow();
  });
});
