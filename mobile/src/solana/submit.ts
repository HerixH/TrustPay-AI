import {
  Connection,
  Keypair,
  Transaction,
  type TransactionSignature,
} from "@solana/web3.js";

export async function submitTx(
  connection: Connection,
  tx: Transaction,
  signers: Keypair[],
): Promise<TransactionSignature> {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  if (signers.length > 0) {
    tx.feePayer = signers[0].publicKey;
  }
  tx.sign(...signers);
  const raw = tx.serialize();
  const sig = await connection.sendRawTransaction(raw, {
    skipPreflight: false,
    maxRetries: 3,
  });
  await connection.confirmTransaction(
    {
      signature: sig,
      blockhash,
      lastValidBlockHeight,
    },
    "confirmed",
  );
  return sig;
}
