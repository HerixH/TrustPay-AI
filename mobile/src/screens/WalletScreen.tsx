import { useState, type ReactNode } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SOLANA_RPC_URL, TRUSTPAY_PROGRAM_ID_STR } from "../constants";
import { useWallet } from "../wallet/WalletContext";

export function WalletScreen() {
  const w = useWallet();
  const [importPrimary, setImportPrimary] = useState("");
  const [importCo, setImportCo] = useState("");
  const [importArb, setImportArb] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      Alert.alert("Wallet", e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Solana wallets (devnet)</Text>
      <Text style={styles.hint}>
        Keys stay on-device (SecureStore). Generate or paste a base58 secret key
        (Solana CLI / Phantom export). Fund SOL on devnet before on-chain steps.
      </Text>
      <Text style={styles.meta}>
        RPC: {SOLANA_RPC_URL}
      </Text>
      <Text style={styles.meta}>
        Program: {TRUSTPAY_PROGRAM_ID_STR.slice(0, 8)}… (override in app.json if
        you deployed your own)
      </Text>

      <Section title="Primary (buyer / init / deposit)">
        <Text style={styles.addr}>
          {w.primary
            ? w.shortAddr(w.primary.publicKey)
            : "Not set — create or import"}
        </Text>
        <View style={styles.row}>
          <Btn
            label={busy ? "…" : "Generate"}
            onPress={() => void run(w.generatePrimary)}
            disabled={busy}
          />
          <Btn
            label="Clear"
            onPress={() => void run(w.clearPrimary)}
            disabled={busy || !w.primary}
            outline
          />
        </View>
        <TextInput
          value={importPrimary}
          onChangeText={setImportPrimary}
          placeholder="Paste base58 secret to import"
          autoCapitalize="none"
          style={styles.input}
        />
        <Btn
          label="Import primary"
          onPress={() =>
            void run(async () => {
              if (!importPrimary.trim()) return;
              await w.importPrimary(importPrimary);
              setImportPrimary("");
            })
          }
          disabled={busy}
        />
      </Section>

      <Section title="Co-signer (seller — mutual release)">
        <Text style={styles.addr}>
          {w.coSigner
            ? w.shortAddr(w.coSigner.publicKey)
            : "Not set"}

        </Text>
        <TextInput
          value={importCo}
          onChangeText={setImportCo}
          placeholder="Seller secret (base58)"
          autoCapitalize="none"
          style={styles.input}
        />
        <View style={styles.row}>
          <Btn
            label="Import co-signer"
            onPress={() =>
              void run(async () => {
                if (!importCo.trim()) return;
                await w.importCoSigner(importCo);
                setImportCo("");
              })
            }
            disabled={busy}
          />
          <Btn
            label="Clear"
            outline
            onPress={() => void run(w.clearCoSigner)}
            disabled={busy || !w.coSigner}
          />
        </View>
      </Section>

      <Section title="Arbiter (resolve dispute)">
        <Text style={styles.addr}>
          {w.arbiter ? w.shortAddr(w.arbiter.publicKey) : "Not set"}
        </Text>
        <TextInput
          value={importArb}
          onChangeText={setImportArb}
          placeholder="Arbiter secret (base58)"
          autoCapitalize="none"
          style={styles.input}
        />
        <View style={styles.row}>
          <Btn
            label="Import arbiter"
            onPress={() =>
              void run(async () => {
                if (!importArb.trim()) return;
                await w.importArbiter(importArb);
                setImportArb("");
              })
            }
            disabled={busy}
          />
          <Btn
            label="Clear"
            outline
            onPress={() => void run(w.clearArbiter)}
            disabled={busy || !w.arbiter}
          />
        </View>
      </Section>
    </ScrollView>
  );
}

function Section(props: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{props.title}</Text>
      {props.children}
    </View>
  );
}

function Btn(props: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  outline?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.btn,
        props.outline ? styles.btnOutline : styles.btnFill,
        props.disabled && { opacity: 0.5 },
      ]}
      disabled={props.disabled}
      onPress={props.onPress}
    >
      <Text
        style={[styles.btnTxt, props.outline && { color: "#0369a1" }]}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: "#f8fafc",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  hint: { marginTop: 8, color: "#475569", lineHeight: 20 },
  meta: { marginTop: 6, fontSize: 11, color: "#64748b" },
  section: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sectionTitle: { fontWeight: "700", color: "#0f172a", marginBottom: 8 },
  addr: { fontFamily: "monospace", fontSize: 13, color: "#0f172a" },
  row: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  btnFill: { backgroundColor: "#0ea5e9" },
  btnOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#0369a1",
  },
  btnTxt: { color: "#fff", fontWeight: "700" },
});
