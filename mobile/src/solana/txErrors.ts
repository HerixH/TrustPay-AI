/**
 * Map low-level Solana RPC / simulation errors to actionable copy for the Deal room.
 */
export function friendlySolanaMessage(err: unknown): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : String(err);
  const lower = raw.toLowerCase();

  const looksLikeFunding =
    lower.includes("insufficient funds") ||
    lower.includes("insufficient funds for rent") ||
    lower.includes("no record of a prior credit") ||
    (lower.includes("attempt to debit an account") &&
      (lower.includes("simulation failed") ||
        lower.includes("no record") ||
        lower.includes("prior credit")));

  if (looksLikeFunding) {
    return "Not enough SOL in your wallet on devnet for this transaction (fees or account rent). Paste your public address into a Solana devnet faucet, airdrop SOL, wait a few seconds, then try again.";
  }

  if (
    lower.includes("simulation failed") &&
    lower.includes("attempt to debit")
  ) {
    return "This transaction needs more devnet SOL (fees/rent). Fund your wallet from a devnet faucet and retry.";
  }

  return raw;
}
