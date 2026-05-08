import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { Buffer } from "buffer";
import { IX } from "./discriminators";

function concat(...parts: Uint8Array[]): Buffer {
  return Buffer.concat(parts.map((p) => Buffer.from(p)));
}

export function initializeIx(
  programId: PublicKey,
  buyer: PublicKey,
  seller: PublicKey,
  escrow: PublicKey,
  vault: PublicKey,
  dealSeed: Uint8Array,
  amountLamports: bigint,
  arbiter: PublicKey,
): TransactionInstruction {
  const data = Buffer.alloc(8 + 8 + 8 + 32);
  Buffer.from(IX.initialize).copy(data, 0);
  Buffer.from(dealSeed).copy(data, 8);
  data.writeBigUInt64LE(amountLamports, 16);
  arbiter.toBuffer().copy(data, 24);

  const keys = [
    { pubkey: buyer, isSigner: true, isWritable: true },
    { pubkey: seller, isSigner: false, isWritable: false },
    { pubkey: escrow, isSigner: false, isWritable: true },
    { pubkey: vault, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];
  return new TransactionInstruction({ keys, programId, data });
}

export function depositIx(
  programId: PublicKey,
  buyer: PublicKey,
  escrow: PublicKey,
  vault: PublicKey,
): TransactionInstruction {
  const data = Buffer.from(IX.deposit);
  const keys = [
    { pubkey: buyer, isSigner: true, isWritable: true },
    { pubkey: escrow, isSigner: false, isWritable: true },
    { pubkey: vault, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];
  return new TransactionInstruction({ keys, programId, data });
}

export function releaseMutualIx(
  programId: PublicKey,
  buyer: PublicKey,
  seller: PublicKey,
  escrow: PublicKey,
  vault: PublicKey,
): TransactionInstruction {
  const data = Buffer.from(IX.releaseMutual);
  const keys = [
    { pubkey: buyer, isSigner: true, isWritable: true },
    { pubkey: seller, isSigner: true, isWritable: true },
    { pubkey: escrow, isSigner: false, isWritable: true },
    { pubkey: vault, isSigner: false, isWritable: true },
  ];
  return new TransactionInstruction({ keys, programId, data });
}

export function openDisputeIx(
  programId: PublicKey,
  participant: PublicKey,
  escrow: PublicKey,
): TransactionInstruction {
  const data = Buffer.from(IX.openDispute);
  const keys = [
    { pubkey: participant, isSigner: true, isWritable: true },
    { pubkey: escrow, isSigner: false, isWritable: true },
  ];
  return new TransactionInstruction({ keys, programId, data });
}

export function resolveDisputeIx(
  programId: PublicKey,
  arbiter: PublicKey,
  buyer: PublicKey,
  seller: PublicKey,
  escrow: PublicKey,
  vault: PublicKey,
  paySeller: boolean,
): TransactionInstruction {
  const data = concat(IX.resolveDispute, Uint8Array.of(paySeller ? 1 : 0));
  const keys = [
    { pubkey: arbiter, isSigner: true, isWritable: true },
    { pubkey: buyer, isSigner: false, isWritable: true },
    { pubkey: seller, isSigner: false, isWritable: true },
    { pubkey: escrow, isSigner: false, isWritable: true },
    { pubkey: vault, isSigner: false, isWritable: true },
  ];
  return new TransactionInstruction({ keys, programId, data });
}
