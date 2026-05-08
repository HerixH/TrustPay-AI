import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { createDeal } from "../api";
import { useWallet } from "../wallet/WalletContext";

type Props = NativeStackScreenProps<RootStackParamList, "DealCreate">;

export function DealCreateScreen({ navigation }: Props) {
  const wallet = useWallet();
  const [buyer, setBuyer] = useState("");
  const [seller, setSeller] = useState("");
  const [arbiter, setArbiter] = useState("");
  const [amount, setAmount] = useState("1000000");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (wallet.primary) {
      setBuyer(wallet.primary.publicKey.toBase58());
    }
  }, [wallet.primary]);

  const submit = async () => {
    setBusy(true);
    try {
      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt <= 0) {
        throw new Error("Amount must be a positive number (lamports).");
      }
      const res = await createDeal({
        buyer: buyer.trim(),
        seller: seller.trim(),
        arbiter: arbiter.trim(),
        amount_lamports: Math.floor(amt),
      });
      const id = res.id as string;
      Alert.alert(
        "Deal created",
        "Open the deal and use On-chain escrow: Initialize, then Deposit (devnet SOL required).",
      );
      navigation.replace("DealDetail", { dealId: id });
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Create deal</Text>
      <Text style={styles.hint}>
        Use devnet wallet pubkeys. Amount is in lamports (1 SOL = 1e9).
      </Text>

      <Field label="Buyer pubkey" value={buyer} onChangeText={setBuyer} />
      <Field label="Seller pubkey" value={seller} onChangeText={setSeller} />
      <Field label="Arbiter pubkey" value={arbiter} onChangeText={setArbiter} />
      <Field label="Amount (lamports)" value={amount} onChangeText={setAmount} />

      <Pressable
        style={[styles.btn, busy && { opacity: 0.6 }]}
        disabled={busy}
        onPress={submit}
      >
        <Text style={styles.btnTxt}>{busy ? "Creating…" : "Create deal"}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingTop: 48, paddingBottom: 40, backgroundColor: "#f8fafc" },
  title: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  hint: { marginTop: 8, color: "#475569", lineHeight: 20 },
  label: { fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  btn: {
    marginTop: 22,
    backgroundColor: "#0ea5e9",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnTxt: { color: "#fff", fontWeight: "700" },
});
