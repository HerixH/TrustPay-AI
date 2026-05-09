import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { SOLANA_RPC_URL } from "../constants";
import {
  walletStorageDelete,
  walletStorageGet,
  walletStorageSet,
} from "./walletStorage";
import { keypairFromImport } from "./keypairImport";

const K_PRIMARY = "trustpay_wallet_primary_v1";
const K_COSIGN = "trustpay_wallet_cosigner_v1";
const K_ARBITER = "trustpay_wallet_arbiter_v1";

function encodeSecret(k: Keypair): string {
  return bs58.encode(k.secretKey);
}

function decodeSecret(s: string): Keypair {
  const raw = bs58.decode(s);
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

export type WalletContextValue = {
  connection: Connection;
  primary: Keypair | null;
  coSigner: Keypair | null;
  arbiter: Keypair | null;
  shortAddr: (pk: PublicKey) => string;
  generatePrimary: () => Promise<void>;
  importPrimary: (secretBs58: string) => Promise<void>;
  clearPrimary: () => Promise<void>;
  generateCoSigner: () => Promise<void>;
  importCoSigner: (secretBs58: string) => Promise<void>;
  clearCoSigner: () => Promise<void>;
  generateArbiter: () => Promise<void>;
  importArbiter: (secretBs58: string) => Promise<void>;
  clearArbiter: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const connection = useMemo(
    () => new Connection(SOLANA_RPC_URL, "confirmed"),
    [],
  );
  const [primary, setPrimary] = useState<Keypair | null>(null);
  const [coSigner, setCoSigner] = useState<Keypair | null>(null);
  const [arbiter, setArbiter] = useState<Keypair | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [p, c, a] = await Promise.all([
          walletStorageGet(K_PRIMARY),
          walletStorageGet(K_COSIGN),
          walletStorageGet(K_ARBITER),
        ]);
        if (p) setPrimary(decodeSecret(p));
        if (c) setCoSigner(decodeSecret(c));
        if (a) setArbiter(decodeSecret(a));
      } catch {
        /* storage unavailable */
      }
    })();
  }, []);

  const shortAddr = useCallback((pk: PublicKey) => {
    const s = pk.toBase58();
    return `${s.slice(0, 4)}…${s.slice(-4)}`;
  }, []);

  const generatePrimary = useCallback(async () => {
    const k = Keypair.generate();
    await walletStorageSet(K_PRIMARY, encodeSecret(k));
    setPrimary(k);
  }, []);

  const importPrimary = useCallback(async (secretBs58: string) => {
    const k = keypairFromImport(secretBs58);
    await walletStorageSet(K_PRIMARY, encodeSecret(k));
    setPrimary(k);
  }, []);

  const clearPrimary = useCallback(async () => {
    await walletStorageDelete(K_PRIMARY);
    setPrimary(null);
  }, []);

  const importCoSigner = useCallback(async (secretBs58: string) => {
    const k = keypairFromImport(secretBs58);
    await walletStorageSet(K_COSIGN, encodeSecret(k));
    setCoSigner(k);
  }, []);

  const generateCoSigner = useCallback(async () => {
    const k = Keypair.generate();
    await walletStorageSet(K_COSIGN, encodeSecret(k));
    setCoSigner(k);
  }, []);

  const clearCoSigner = useCallback(async () => {
    await walletStorageDelete(K_COSIGN);
    setCoSigner(null);
  }, []);

  const importArbiter = useCallback(async (secretBs58: string) => {
    const k = keypairFromImport(secretBs58);
    await walletStorageSet(K_ARBITER, encodeSecret(k));
    setArbiter(k);
  }, []);

  const generateArbiter = useCallback(async () => {
    const k = Keypair.generate();
    await walletStorageSet(K_ARBITER, encodeSecret(k));
    setArbiter(k);
  }, []);

  const clearArbiter = useCallback(async () => {
    await walletStorageDelete(K_ARBITER);
    setArbiter(null);
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      connection,
      primary,
      coSigner,
      arbiter,
      shortAddr,
      generatePrimary,
      importPrimary,
      clearPrimary,
      generateCoSigner,
      importCoSigner,
      clearCoSigner,
      generateArbiter,
      importArbiter,
      clearArbiter,
    }),
    [
      arbiter,
      clearArbiter,
      clearCoSigner,
      clearPrimary,
      coSigner,
      connection,
      generateArbiter,
      generateCoSigner,
      generatePrimary,
      importArbiter,
      importCoSigner,
      importPrimary,
      primary,
      shortAddr,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const c = useContext(WalletContext);
  if (!c) throw new Error("useWallet must be used within WalletProvider");
  return c;
}
