import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../navigation/types";
import { createDeal } from "../api";
import { useWallet } from "../wallet/WalletContext";
import { COLORS, LAYOUT } from "../theme";

type Props = NativeStackScreenProps<HomeStackParamList, "DealCreate">;

export function DealCreateScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
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
    <ScrollView
      contentContainerStyle={[
        styles.wrap,
        {
          paddingBottom: Math.max(40, insets.bottom + 24) + tabBarHeight,
        },
      ]}
    >
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
        placeholderTextColor={COLORS.textFaint}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: LAYOUT.screenPadding,
    paddingTop: 48,
    paddingBottom: 40,
    backgroundColor: COLORS.bg,
  },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  hint: { marginTop: 8, color: COLORS.textMuted, lineHeight: 22 },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.surfaceRaised,
    fontSize: 15,
    color: COLORS.text,
  },
  btn: {
    marginTop: 22,
    backgroundColor: COLORS.accentPurple,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnTxt: { color: COLORS.textOnGradient, fontWeight: "700", fontSize: 15 },
});
