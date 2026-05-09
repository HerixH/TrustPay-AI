import {
  Keypair,
  PublicKey,
  Transaction,
  type Connection,
} from "@solana/web3.js";
import type { DealBundle } from "../api";
import {
  depositIx,
  initializeIx,
  openDisputeIx,
  releaseMutualIx,
  resolveDisputeIx,
} from "./instructions";
import { dealSeedFromHex, escrowPda, vaultPda } from "./pda";
import { submitTx } from "./submit";
import { submitTxViaMwa } from "./mwaSubmit";

function programId(bundle: DealBundle): PublicKey {
  return new PublicKey(bundle.solana.program_id.trim());
}

export async function runInitialize(
  connection: Connection,
  buyer: Keypair,
  bundle: DealBundle,
): Promise<string> {
  const program = programId(bundle);
  const buyerPk = buyer.publicKey;
  const seller = new PublicKey(bundle.deal.seller.trim());
  const arbiter = new PublicKey(bundle.deal.arbiter.trim());
  const seed = dealSeedFromHex(bundle.deal.deal_seed);
  const escrow = escrowPda(program, buyerPk, seller, seed);
  const vault = vaultPda(program, escrow);
  const ix = initializeIx(
    program,
    buyerPk,
    seller,
    escrow,
    vault,
    seed,
    BigInt(bundle.deal.amount_lamports),
    arbiter,
  );
  const tx = new Transaction().add(ix);
  return submitTx(connection, tx, [buyer]);
}

export async function runDeposit(
  connection: Connection,
  buyer: Keypair,
  bundle: DealBundle,
): Promise<string> {
  const program = programId(bundle);
  const buyerPk = buyer.publicKey;
  const seller = new PublicKey(bundle.deal.seller.trim());
  const seed = dealSeedFromHex(bundle.deal.deal_seed);
  const escrow = escrowPda(program, buyerPk, seller, seed);
  const vault = vaultPda(program, escrow);
  const tx = new Transaction().add(depositIx(program, buyerPk, escrow, vault));
  return submitTx(connection, tx, [buyer]);
}

export async function runReleaseMutual(
  connection: Connection,
  buyer: Keypair,
  seller: Keypair,
  bundle: DealBundle,
): Promise<string> {
  const program = programId(bundle);
  const buyerPk = buyer.publicKey;
  const sellerPk = seller.publicKey;
  const seed = dealSeedFromHex(bundle.deal.deal_seed);
  const escrow = escrowPda(program, buyerPk, sellerPk, seed);
  const vault = vaultPda(program, escrow);
  const tx = new Transaction().add(
    releaseMutualIx(program, buyerPk, sellerPk, escrow, vault),
  );
  return submitTx(connection, tx, [buyer, seller]);
}

export async function runOpenDispute(
  connection: Connection,
  participant: Keypair,
  bundle: DealBundle,
): Promise<string> {
  const program = programId(bundle);
  const buyer = new PublicKey(bundle.deal.buyer.trim());
  const seller = new PublicKey(bundle.deal.seller.trim());
  const seed = dealSeedFromHex(bundle.deal.deal_seed);
  const escrow = escrowPda(program, buyer, seller, seed);
  const tx = new Transaction().add(
    openDisputeIx(program, participant.publicKey, escrow),
  );
  return submitTx(connection, tx, [participant]);
}

export async function runResolveDispute(
  connection: Connection,
  arbiterKey: Keypair,
  bundle: DealBundle,
  paySeller: boolean,
): Promise<string> {
  const program = programId(bundle);
  const buyer = new PublicKey(bundle.deal.buyer.trim());
  const seller = new PublicKey(bundle.deal.seller.trim());
  const seed = dealSeedFromHex(bundle.deal.deal_seed);
  const escrow = escrowPda(program, buyer, seller, seed);
  const vault = vaultPda(program, escrow);
  const tx = new Transaction().add(
    resolveDisputeIx(
      program,
      arbiterKey.publicKey,
      buyer,
      seller,
      escrow,
      vault,
      paySeller,
    ),
  );
  return submitTx(connection, tx, [arbiterKey]);
}

/* ─── Same flows signed via Mobile Wallet Adapter (Phantom, etc.) ─── */

export async function runInitializeMwa(
  connection: Connection,
  bundle: DealBundle,
): Promise<string> {
  const program = programId(bundle);
  const buyerPk = new PublicKey(bundle.deal.buyer.trim());
  const seller = new PublicKey(bundle.deal.seller.trim());
  const arbiter = new PublicKey(bundle.deal.arbiter.trim());
  const seed = dealSeedFromHex(bundle.deal.deal_seed);
  const escrow = escrowPda(program, buyerPk, seller, seed);
  const vault = vaultPda(program, escrow);
  const ix = initializeIx(
    program,
    buyerPk,
    seller,
    escrow,
    vault,
    seed,
    BigInt(bundle.deal.amount_lamports),
    arbiter,
  );
  const tx = new Transaction().add(ix);
  return submitTxViaMwa(connection, tx, buyerPk);
}

export async function runDepositMwa(
  connection: Connection,
  bundle: DealBundle,
): Promise<string> {
  const program = programId(bundle);
  const buyerPk = new PublicKey(bundle.deal.buyer.trim());
  const seller = new PublicKey(bundle.deal.seller.trim());
  const seed = dealSeedFromHex(bundle.deal.deal_seed);
  const escrow = escrowPda(program, buyerPk, seller, seed);
  const vault = vaultPda(program, escrow);
  const tx = new Transaction().add(
    depositIx(program, buyerPk, escrow, vault),
  );
  return submitTxViaMwa(connection, tx, buyerPk);
}

export async function runReleaseMutualMwa(
  connection: Connection,
  seller: Keypair,
  bundle: DealBundle,
): Promise<string> {
  const program = programId(bundle);
  const buyerPk = new PublicKey(bundle.deal.buyer.trim());
  const sellerPk = seller.publicKey;
  const expectedSeller = new PublicKey(bundle.deal.seller.trim());
  if (!sellerPk.equals(expectedSeller)) {
    throw new Error("Co-signer pubkey must match this deal's seller.");
  }
  const seed = dealSeedFromHex(bundle.deal.deal_seed);
  const escrow = escrowPda(program, buyerPk, sellerPk, seed);
  const vault = vaultPda(program, escrow);
  const tx = new Transaction().add(
    releaseMutualIx(program, buyerPk, sellerPk, escrow, vault),
  );
  return submitTxViaMwa(connection, tx, buyerPk, {
    partialSigners: [seller],
  });
}

export async function runOpenDisputeMwa(
  connection: Connection,
  bundle: DealBundle,
  role: "buyer" | "seller",
): Promise<string> {
  const program = programId(bundle);
  const buyer = new PublicKey(bundle.deal.buyer.trim());
  const seller = new PublicKey(bundle.deal.seller.trim());
  const participant =
    role === "buyer" ? buyer : seller;
  const seed = dealSeedFromHex(bundle.deal.deal_seed);
  const escrow = escrowPda(program, buyer, seller, seed);
  const tx = new Transaction().add(
    openDisputeIx(program, participant, escrow),
  );
  return submitTxViaMwa(connection, tx, participant);
}

export async function runResolveDisputeMwa(
  connection: Connection,
  bundle: DealBundle,
  paySeller: boolean,
): Promise<string> {
  const program = programId(bundle);
  const buyer = new PublicKey(bundle.deal.buyer.trim());
  const seller = new PublicKey(bundle.deal.seller.trim());
  const arbiter = new PublicKey(bundle.deal.arbiter.trim());
  const seed = dealSeedFromHex(bundle.deal.deal_seed);
  const escrow = escrowPda(program, buyer, seller, seed);
  const vault = vaultPda(program, escrow);
  const tx = new Transaction().add(
    resolveDisputeIx(
      program,
      arbiter,
      buyer,
      seller,
      escrow,
      vault,
      paySeller,
    ),
  );
  return submitTxViaMwa(connection, tx, arbiter);
}
