import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { PublicKey } from "@solana/web3.js";
import { Audio } from "expo-av";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  analyzeDeal,
  getDeal,
  listMessages,
  postMessage,
  voiceContract,
  type DealBundle,
} from "../api";
import type { RootStackParamList } from "../navigation";
import {
  runDeposit,
  runInitialize,
  runOpenDispute,
  runReleaseMutual,
  runResolveDispute,
} from "../solana/escrowFlow";
import { readEscrowStatus, escrowStatusLabel } from "../solana/parse";
import { useWallet } from "../wallet/WalletContext";

type Props = NativeStackScreenProps<RootStackParamList, "DealDetail">;

function tierColor(tier: string | undefined) {
  const t = (tier || "").toLowerCase();
  if (t === "high") return "#b91c1c";
  if (t === "medium") return "#b45309";
  return "#15803d";
}

export function DealDetailScreen({ route }: Props) {
  const { dealId } = route.params;
  const wallet = useWallet();
  const [bundle, setBundle] = useState<DealBundle | null>(null);
  const [messages, setMessages] = useState<
    { id: number; sender: string; body: string; created_at: number }[]
  >([]);
  const [sender, setSender] = useState("seller");
  const [msg, setMsg] = useState("");
  const [includeChain, setIncludeChain] = useState(false);
  const [busy, setBusy] = useState(false);
  const [chainBusy, setChainBusy] = useState(false);
  const [escrowStatus, setEscrowStatus] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    setBusy(true);
    try {
      const [b, m] = await Promise.all([
        getDeal(dealId, includeChain),
        listMessages(dealId),
      ]);
      setBundle(b);
      setMessages(m);
      try {
        const pk = new PublicKey(b.solana.escrow_pubkey);
        const acc = await wallet.connection.getAccountInfo(pk, "confirmed");
        const raw = readEscrowStatus(acc?.data ?? null);
        setEscrowStatus(raw === null ? "uninitialized" : escrowStatusLabel(raw));
      } catch {
        setEscrowStatus(null);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }, [dealId, includeChain, wallet.connection]);

  useEffect(() => {
    void load();
  }, [load]);

  const runChain = async (fn: () => Promise<string>) => {
    setChainBusy(true);
    setErr(null);
    try {
      const sig = await fn();
      await load();
      const url = `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
      Alert.alert("On-chain ok", sig.slice(0, 12) + "…", [
        { text: "Explorer", onPress: () => void Linking.openURL(url) },
        { text: "OK", style: "cancel" },
      ]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setChainBusy(false);
    }
  };

  const send = async () => {
    const body = msg.trim();
    if (!body) return;
    setBusy(true);
    try {
      await postMessage(dealId, sender.trim(), body);
      setMsg("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const runAnalyze = async () => {
    setBusy(true);
    try {
      await analyzeDeal(dealId);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const playVoice = async () => {
    setBusy(true);
    try {
      const res = await voiceContract(dealId);
      if (!res.audio_base64) {
        setErr(res.note || "No audio — set ELEVENLABS_API_KEY on the API.");
        return;
      }
      const uri = `data:audio/mpeg;base64,${res.audio_base64}`;
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      sound.setOnPlaybackStatusUpdate((st) => {
        if (st.isLoaded && st.didJustFinish) {
          void sound.unloadAsync();
        }
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (!bundle && busy) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!bundle) {
    return (
      <View style={styles.centered}>
        <Text>{err || "Failed to load deal."}</Text>
        <Pressable style={styles.secondary} onPress={() => void load()}>
          <Text style={styles.secondaryTxt}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const risk = bundle.last_risk_score;

  const buyerAddr = bundle.deal.buyer.trim();
  const sellerAddr = bundle.deal.seller.trim();
  const arbAddr = bundle.deal.arbiter.trim();
  const pri = wallet.primary?.publicKey.toBase58();
  const cos = wallet.coSigner?.publicKey.toBase58();
  const arbKp = wallet.arbiter?.publicKey.toBase58();

  const canBuyerOps = !!wallet.primary && pri === buyerAddr;
  const canRelease =
    !!wallet.primary &&
    !!wallet.coSigner &&
    pri === buyerAddr &&
    cos === sellerAddr;
  const disputeSignerBuyer = wallet.primary && pri === buyerAddr ? wallet.primary : null;
  const disputeSignerSeller =
    wallet.primary && pri === sellerAddr
      ? wallet.primary
      : wallet.coSigner && cos === sellerAddr
        ? wallet.coSigner
        : null;
  const canResolve = !!wallet.arbiter && arbKp === arbAddr;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <FlatList
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <Text style={styles.title}>Deal {bundle.deal.id.slice(0, 8)}…</Text>
            <Text style={styles.meta}>
              Amount λ {bundle.deal.amount_lamports} • seed {bundle.deal.deal_seed}
            </Text>

            <View style={styles.riskRow}>
              <Text style={styles.riskLabel}>Risk tier</Text>
              <Text style={[styles.riskValue, { color: tierColor(risk?.tier) }]}>
                {(risk?.tier || "none").toUpperCase()}
              </Text>
            </View>
            {risk?.rationale ? (
              <Text style={styles.rationale}>{risk.rationale}</Text>
            ) : null}

            <View style={styles.rowBetween}>
              <Text style={styles.label}>Fetch chain account (RPC)</Text>
              <Switch value={includeChain} onValueChange={setIncludeChain} />
            </View>

            <View style={styles.solBox}>
              <Text style={styles.solTitle}>Solana (devnet)</Text>
              <Text style={styles.mono}>{bundle.solana.escrow_pubkey}</Text>
              <View style={styles.linkRow}>
                <Pressable onPress={() => Linking.openURL(bundle.solana.explorer_escrow)}>
                  <Text style={styles.link}>Escrow explorer</Text>
                </Pressable>
                <Pressable onPress={() => Linking.openURL(bundle.solana.explorer_vault)}>
                  <Text style={[styles.link, { marginLeft: 12 }]}>Vault explorer</Text>
                </Pressable>
              </View>
              {bundle.solana.chain ? (
                <Text style={styles.smallChain}>
                  {JSON.stringify(bundle.solana.chain, null, 2).slice(0, 800)}
                </Text>
              ) : null}
            </View>

            <View style={styles.onChainBox}>
              <Text style={styles.solTitle}>On-chain escrow</Text>
              <Text style={styles.onChainMeta}>
                PDA status: {escrowStatus ?? "—"} · fund SOL on devnet first.
              </Text>
              {!wallet.primary ? (
                <Text style={styles.warn}>
                  Open Wallets & keys from the home screen and generate or import the buyer key (must
                  match Buyer pubkey).
                </Text>
              ) : null}

              <Pressable
                style={[styles.ocBtn, (chainBusy || !canBuyerOps) && { opacity: 0.5 }]}
                disabled={chainBusy || !canBuyerOps}
                onPress={() =>
                  void runChain(() =>
                    runInitialize(wallet.connection, wallet.primary!, bundle),
                  )
                }
              >
                <Text style={styles.ocBtnTxt}>1 · Initialize</Text>
              </Pressable>

              <Pressable
                style={[styles.ocBtn, (chainBusy || !canBuyerOps) && { opacity: 0.5 }]}
                disabled={chainBusy || !canBuyerOps}
                onPress={() =>
                  void runChain(() =>
                    runDeposit(wallet.connection, wallet.primary!, bundle),
                  )
                }
              >
                <Text style={styles.ocBtnTxt}>2 · Deposit lamports</Text>
              </Pressable>

              <Pressable
                style={[styles.ocBtn, (chainBusy || !canRelease) && { opacity: 0.5 }]}
                disabled={chainBusy || !canRelease}
                onPress={() =>
                  void runChain(() =>
                    runReleaseMutual(
                      wallet.connection,
                      wallet.primary!,
                      wallet.coSigner!,
                      bundle,
                    ),
                  )
                }
              >
                <Text style={styles.ocBtnTxt}>Release (buyer + seller keys)</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.ocBtnOutline,
                  (chainBusy || !disputeSignerBuyer) && { opacity: 0.5 },
                ]}
                disabled={chainBusy || !disputeSignerBuyer}
                onPress={() =>
                  void runChain(() =>
                    runOpenDispute(wallet.connection, disputeSignerBuyer!, bundle),
                  )
                }
              >
                <Text style={styles.ocBtnTxtB}>Dispute (buyer)</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.ocBtnOutline,
                  (chainBusy || !disputeSignerSeller) && { opacity: 0.5 },
                ]}
                disabled={chainBusy || !disputeSignerSeller}
                onPress={() =>
                  void runChain(() =>
                    runOpenDispute(wallet.connection, disputeSignerSeller!, bundle),
                  )
                }
              >
                <Text style={styles.ocBtnTxtB}>Dispute (seller)</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.ocBtnOutline,
                  (chainBusy || !canResolve) && { opacity: 0.5 },
                ]}
                disabled={chainBusy || !canResolve}
                onPress={() =>
                  void runChain(() =>
                    runResolveDispute(
                      wallet.connection,
                      wallet.arbiter!,
                      bundle,
                      true,
                    ),
                  )
                }
              >
                <Text style={styles.ocBtnTxtB}>Resolve → seller (arbiter)</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.ocBtnOutline,
                  (chainBusy || !canResolve) && { opacity: 0.5 },
                ]}
                disabled={chainBusy || !canResolve}
                onPress={() =>
                  void runChain(() =>
                    runResolveDispute(
                      wallet.connection,
                      wallet.arbiter!,
                      bundle,
                      false,
                    ),
                  )
                }
              >
                <Text style={styles.ocBtnTxtB}>Resolve → buyer refund (arbiter)</Text>
              </Pressable>

              {chainBusy ? (
                <ActivityIndicator style={{ marginTop: 10 }} />
              ) : null}
            </View>

            <View style={styles.actions}>
              <Pressable
                style={[styles.primary, busy && { opacity: 0.6 }]}
                disabled={busy}
                onPress={() => void runAnalyze()}
              >
                <Text style={styles.primaryTxt}>Analyze chat (AI)</Text>
              </Pressable>
              <Pressable
                style={[styles.outline, busy && { opacity: 0.6 }]}
                disabled={busy}
                onPress={() => void playVoice()}
              >
                <Text style={styles.outlineTxt}>Voice contract</Text>
              </Pressable>
            </View>

            <Text style={styles.chatTitle}>Messages</Text>
            <View style={styles.senderRow}>
              <Text style={styles.label}>Speaking as</Text>
              <TextInput
                style={styles.senderInput}
                value={sender}
                onChangeText={setSender}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.composer}>
              <TextInput
                style={styles.msgInput}
                value={msg}
                onChangeText={setMsg}
                placeholder="Try: “pay outside the platform with gift cards”"
                placeholderTextColor="#94a3b8"
                multiline
              />
              <Pressable
                style={[styles.send, busy && { opacity: 0.6 }]}
                disabled={busy}
                onPress={() => void send()}
              >
                <Text style={styles.sendTxt}>Send</Text>
              </Pressable>
            </View>
            {err ? <Text style={styles.error}>{err}</Text> : null}
            {busy ? <ActivityIndicator style={{ marginVertical: 8 }} /> : null}
          </View>
        }
        data={messages}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View style={styles.bubble}>
            <Text style={styles.bubbleSender}>{item.sender}</Text>
            <Text style={styles.bubbleBody}>{item.body}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  meta: { marginTop: 4, color: "#475569", fontSize: 12 },
  riskRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  riskLabel: { fontWeight: "600", color: "#334155" },
  riskValue: { fontWeight: "800", fontSize: 16 },
  rationale: { marginTop: 6, color: "#334155", lineHeight: 20 },
  rowBetween: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontWeight: "600", color: "#475569" },
  solBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  solTitle: { fontWeight: "700", marginBottom: 6, color: "#0f172a" },
  mono: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    fontSize: 11,
    color: "#0f172a",
  },
  linkRow: { flexDirection: "row", marginTop: 8 },
  link: { color: "#0369a1", fontWeight: "600" },
  smallChain: {
    marginTop: 8,
    fontSize: 10,
    color: "#475569",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  onChainBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    gap: 8,
  },
  onChainMeta: { fontSize: 12, color: "#475569", marginBottom: 4 },
  warn: { fontSize: 12, color: "#b45309", marginBottom: 6 },
  ocBtn: {
    backgroundColor: "#0f766e",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  ocBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },
  ocBtnOutline: {
    borderWidth: 1,
    borderColor: "#0f766e",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  ocBtnTxtB: { color: "#0f766e", fontWeight: "700", fontSize: 13 },
  actions: { marginTop: 14, gap: 10 },
  primary: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryTxt: { color: "#fff", fontWeight: "700" },
  outline: {
    borderWidth: 1,
    borderColor: "#0369a1",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  outlineTxt: { color: "#0369a1", fontWeight: "700" },
  chatTitle: { marginTop: 20, fontWeight: "700", fontSize: 16, color: "#0f172a" },
  senderRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  senderInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  composer: { marginTop: 8, gap: 8 },
  msgInput: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  send: {
    alignSelf: "flex-end",
    backgroundColor: "#1e293b",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendTxt: { color: "#fff", fontWeight: "700" },
  bubble: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  bubbleSender: { fontWeight: "700", color: "#0f172a", marginBottom: 4 },
  bubbleBody: { color: "#334155", lineHeight: 20 },
  error: { color: "#b91c1c", marginTop: 8 },
  secondary: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  secondaryTxt: { fontWeight: "600" },
});
