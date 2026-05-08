import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useState, type ReactNode } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GlassCard } from "../components/GlassCard";
import { SOLANA_RPC_URL, TRUSTPAY_PROGRAM_ID_STR } from "../constants";
import { screenScroll } from "../styles/screenScroll";
import { COLORS, LAYOUT } from "../theme";
import { useWallet } from "../wallet/WalletContext";

export function WalletScreen() {
  const tabBarHeight = useBottomTabBarHeight();
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
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            screenScroll.content,
            styles.contentTail,
            { paddingBottom: 28 + tabBarHeight },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.kicker}>Solana · devnet</Text>
          <Text style={styles.title}>Wallets</Text>
          <Text style={styles.hint}>
            Keys stay on-device (SecureStore). Generate or paste a base58 secret
            key (Solana CLI / Phantom export). Fund SOL on devnet before on-chain
            steps.
          </Text>
          <Text style={styles.meta} selectable>
            RPC: {SOLANA_RPC_URL}
          </Text>
          <Text style={styles.meta} selectable>
            Program: {TRUSTPAY_PROGRAM_ID_STR.slice(0, 8)}… (override in
            app.json if you deployed your own)
          </Text>

          <WalletSection
            title="Primary (buyer / init / deposit)"
            accent="top"
            style={styles.firstCard}
          >
            <Text style={styles.addr}>
              {w.primary
                ? w.shortAddr(w.primary.publicKey)
                : "Not set — create or import"}
            </Text>
            <View style={styles.btnStack}>
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
              placeholderTextColor={COLORS.textFaint}
              autoCapitalize="none"
              style={styles.input}
            />
            <View style={styles.btnStackTight}>
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
            </View>
          </WalletSection>

          <WalletSection title="Co-signer (seller — mutual release)">
            <Text style={styles.addr}>
              {w.coSigner
                ? w.shortAddr(w.coSigner.publicKey)
                : "Not set"}
            </Text>
            <TextInput
              value={importCo}
              onChangeText={setImportCo}
              placeholder="Seller secret (base58)"
              placeholderTextColor={COLORS.textFaint}
              autoCapitalize="none"
              style={styles.input}
            />
            <View style={styles.btnStack}>
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
          </WalletSection>

          <WalletSection title="Arbiter (resolve dispute)">
            <Text style={styles.addr}>
              {w.arbiter ? w.shortAddr(w.arbiter.publicKey) : "Not set"}
            </Text>
            <TextInput
              value={importArb}
              onChangeText={setImportArb}
              placeholder="Arbiter secret (base58)"
              placeholderTextColor={COLORS.textFaint}
              autoCapitalize="none"
              style={styles.input}
            />
            <View style={styles.btnStack}>
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
          </WalletSection>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function WalletSection(props: {
  title: string;
  children: ReactNode;
  accent?: "top" | "none";
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <GlassCard
      style={[styles.block, props.style]}
      accent={props.accent ?? "none"}
    >
      <Text style={styles.sectionTitle}>{props.title}</Text>
      {props.children}
    </GlassCard>
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
      style={({ pressed }) => [
        styles.btn,
        props.outline ? styles.btnOutline : styles.btnFill,
        props.disabled && { opacity: 0.5 },
        pressed && !props.disabled && { opacity: 0.88 },
      ]}
      disabled={props.disabled}
      onPress={props.onPress}
    >
      <Text
        style={[styles.btnTxt, props.outline && styles.btnTxtOutline]}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  contentTail: {
    paddingTop: 8,
  },
  kicker: {
    color: COLORS.textFaint,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  hint: {
    marginTop: 8,
    color: COLORS.textMuted,
    lineHeight: 22,
    fontSize: 15,
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textFaint,
    lineHeight: 18,
  },
  block: {
    marginTop: LAYOUT.blockGap,
  },
  firstCard: {
    marginTop: LAYOUT.sectionGap,
  },
  sectionTitle: {
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
    fontSize: 15,
  },
  addr: {
    fontFamily: "monospace",
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    marginBottom: 4,
  },
  btnStack: {
    gap: 10,
    marginTop: 12,
  },
  btnStackTight: {
    marginTop: 12,
  },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    backgroundColor: COLORS.surfaceRaised,
    color: COLORS.text,
    fontSize: 16,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
    justifyContent: "center",
    borderRadius: 12,
    alignItems: "center",
  },
  btnFill: { backgroundColor: COLORS.accentBlue },
  btnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.accentTeal,
  },
  btnTxt: { color: COLORS.textOnGradient, fontWeight: "700", fontSize: 15 },
  btnTxtOutline: { color: COLORS.accentTeal },
});
