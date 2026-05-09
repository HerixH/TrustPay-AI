import { Keypair } from "@solana/web3.js";
import { fromUint8Array } from "js-base64";
import { publicKeyFromMwaAccountAddress } from "../mwaPubkey";

describe("publicKeyFromMwaAccountAddress", () => {
  it("decodes base64-encoded 32-byte pubkey (MWA-style)", () => {
    const kp = Keypair.generate();
    const b64 = fromUint8Array(kp.publicKey.toBytes());
    const pk = publicKeyFromMwaAccountAddress(b64);
    expect(pk.equals(kp.publicKey)).toBe(true);
  });

  it("decodes base58 pubkey string", () => {
    const kp = Keypair.generate();
    const b58 = kp.publicKey.toBase58();
    const pk = publicKeyFromMwaAccountAddress(b58);
    expect(pk.equals(kp.publicKey)).toBe(true);
  });
});
