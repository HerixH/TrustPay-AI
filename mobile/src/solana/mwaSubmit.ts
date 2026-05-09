import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  type TransactionSignature,
} from "@solana/web3.js";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { Platform } from "react-native";
import { MWA_APP_IDENTITY, SOLANA_MWA_CHAIN } from "../constants";
import { friendlySolanaMessage } from "./txErrors";
import { publicKeyFromMwaAccountAddress } from "./mwaPubkey";

export type SubmitViaMwaOptions = Readonly<{
  /** Sign locally first (e.g. seller partial sign on mutual release). */
  partialSigners?: Keypair[];
}>;

/**
 * Signs & sends with Mobile Wallet Adapter (Phantom, Solflare mobile, etc.).
 * The authorized wallet account must match `expectedSigner`.
 */
export async function submitTxViaMwa(
  connection: Connection,
  tx: Transaction,
  expectedSigner: PublicKey,
  options?: SubmitViaMwaOptions,
): Promise<TransactionSignature> {
  if (Platform.OS !== "android") {
    throw new Error(
      "Mobile Wallet Adapter signing is supported on Android with a dev build (not Expo Go).",
    );
  }

  try {
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;

    const partial = options?.partialSigners ?? [];
    if (partial.length > 0) {
      tx.partialSign(...partial);
    }

    return await transact(async (wallet) => {
      const auth = await wallet.authorize({
        identity: MWA_APP_IDENTITY,
        chain: SOLANA_MWA_CHAIN,
      });
      const addr = auth.accounts[0]?.address;
      if (!addr) {
        throw new Error("Wallet returned no account.");
      }
      const walletPk = publicKeyFromMwaAccountAddress(addr);
      if (!walletPk.equals(expectedSigner)) {
        throw new Error(
          `Connected wallet ${walletPk.toBase58().slice(0, 4)}… must match expected ${expectedSigner.toBase58().slice(0, 4)}… for this action.`,
        );
      }

      tx.feePayer = walletPk;

      const sigs = await wallet.signAndSendTransactions({
        transactions: [tx],
        commitment: "confirmed",
        skipPreflight: false,
        maxRetries: 3,
      });
      const sig = sigs[0];
      if (!sig) throw new Error("Wallet did not return a signature.");

      await connection.confirmTransaction(
        {
          signature: sig,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed",
      );
      return sig;
    });
  } catch (e) {
    throw new Error(friendlySolanaMessage(e));
  }
}
