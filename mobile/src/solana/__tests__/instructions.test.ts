import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  depositIx,
  initializeIx,
  openDisputeIx,
  releaseMutualIx,
  resolveDisputeIx,
} from "../instructions";

describe("instructions", () => {
  const program = new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFDSn");
  const buyer = new PublicKey("So11111111111111111111111111111111111111112");
  const seller = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
  const arb = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const escrow = new PublicKey("CmgGg7QKYPFutZAzZNzyFd32ktoBF54d4g66kt91hNCb");
  const vault = new PublicKey("FXf3jukbDCRUjsjX1UZRSpi9tmjFaLwCzEWtuw4bSxYS");

  it("initialize data is 56 bytes (disc + seed + amount + arbiter)", () => {
    const seed = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);
    const ix = initializeIx(
      program,
      buyer,
      seller,
      escrow,
      vault,
      seed,
      12345n,
      arb,
    );
    expect(ix.data.length).toBe(56);
    expect(ix.keys.map((k) => k.pubkey.equals(SystemProgram.programId)).some(Boolean)).toBe(true);
  });

  it("deposit and release ix use compact data", () => {
    expect(depositIx(program, buyer, escrow, vault).data.length).toBe(8);
    expect(releaseMutualIx(program, buyer, seller, escrow, vault).data.length).toBe(8);
    expect(openDisputeIx(program, buyer, escrow).data.length).toBe(8);
  });

  it("resolve_dispute appends bool byte", () => {
    const ix = resolveDisputeIx(program, arb, buyer, seller, escrow, vault, true);
    expect(ix.data.length).toBe(9);
    expect(ix.data[8]).toBe(1);
    const ix2 = resolveDisputeIx(program, arb, buyer, seller, escrow, vault, false);
    expect(ix2.data[8]).toBe(0);
  });
});
