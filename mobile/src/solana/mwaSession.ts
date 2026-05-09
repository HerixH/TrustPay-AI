import { PublicKey } from "@solana/web3.js";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { MWA_APP_IDENTITY, SOLANA_MWA_CHAIN } from "../constants";
import { publicKeyFromMwaAccountAddress } from "./mwaPubkey";

/** Opens MWA (Phantom, etc.), completes authorize, returns the active account pubkey. */
export async function authorizeMobileWalletPubkey(): Promise<PublicKey> {
  return transact(async (wallet) => {
    const auth = await wallet.authorize({
      identity: MWA_APP_IDENTITY,
      chain: SOLANA_MWA_CHAIN,
    });
    const addr = auth.accounts[0]?.address;
    if (!addr) {
      throw new Error("Wallet returned no account — pick an account in the wallet.");
    }
    return publicKeyFromMwaAccountAddress(addr);
  });
}
