import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { File, Paths } from "expo-file-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  analyzeDeal,
  getDeal,
  listMessages,
  postMessage,
  voiceContract,
  type DealBundle,
} from "../api";
import type { HomeStackParamList } from "../navigation/types";
import {
  runDeposit,
  runDepositMwa,
  runInitialize,
  runInitializeMwa,
  runOpenDispute,
  runOpenDisputeMwa,
  runReleaseMutual,
  runReleaseMutualMwa,
  runResolveDispute,
  runResolveDisputeMwa,
} from "../solana/escrowFlow";
import { readEscrowStatus, escrowStatusLabel } from "../solana/parse";
import { LinearGradient } from "expo-linear-gradient";
import { useWallet } from "../wallet/WalletContext";
import {
  COLORS,
  GRADIENT_CTA,
  GRADIENT_CTA_LOCATIONS,
  GRADIENT_SOLANA_BAR,
  LAYOUT,
} from "../theme";

type Props = NativeStackScreenProps<HomeStackParamList, "DealDetail">;

const chainStyles = StyleSheet.create({
  gradWrap: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradInner: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  gradLabel: {
    color: COLORS.textOnGradient,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.2,
  },
  gradWrapSm: {
    borderRadius: 10,
    overflow: "hidden",
    alignSelf: "flex-end",
  },
  gradInnerSm: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  gradLabelSm: {
    color: COLORS.textOnGradient,
    fontWeight: "800",
    fontSize: 14,
  },
  outWrap: {
    borderRadius: 12,
    overflow: "hidden",
  },
  outRing: {
    borderRadius: 12,
    padding: 1,
  },
  outFill: {
    borderRadius: 11,
    backgroundColor: COLORS.surfaceRaised,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
  },
  outLabel: {
    color: COLORS.accentMint,
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.15,
  },
});

function ChainGradientButton({
  label,
  onPress,
  disabled,
  compact,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        compact ? chainStyles.gradWrapSm : chainStyles.gradWrap,
        disabled && { opacity: 0.48 },
        pressed && !disabled && { opacity: 0.92 },
      ]}
    >
      <LinearGradient
        colors={[...GRADIENT_CTA]}
        locations={[...GRADIENT_CTA_LOCATIONS]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={compact ? chainStyles.gradInnerSm : chainStyles.gradInner}
      >
        <Text style={compact ? chainStyles.gradLabelSm : chainStyles.gradLabel}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function ChainOutlineButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        chainStyles.outWrap,
        disabled && { opacity: 0.48 },
        pressed && !disabled && { opacity: 0.9 },
      ]}
    >
      <LinearGradient
        colors={[...GRADIENT_CTA]}
        locations={[...GRADIENT_CTA_LOCATIONS]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={chainStyles.outRing}
      >
        <View style={chainStyles.outFill}>
          <Text style={chainStyles.outLabel}>{label}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function tierColor(tier: string | undefined) {
  const t = (tier || "").toLowerCase();
  if (t === "high") return COLORS.danger;
  if (t === "medium") return COLORS.warn;
  return COLORS.success;
}

export function DealDetailScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
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
  const voiceSoundRef = useRef<Audio.Sound | null>(null);

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
    setErr(null);
    let cleanupFile: (() => void) | undefined;
    try {
      if (voiceSoundRef.current) {
        try {
          await voiceSoundRef.current.unloadAsync();
        } catch {
          /* interrupted or already unloaded */
        }
        voiceSoundRef.current = null;
      }

      const res = await voiceContract(dealId);
      if (!res.audio_base64) {
        const dbg =
          res.elevenlabs_http_status != null || res.elevenlabs_detail
            ? ` ElevenLabs: HTTP ${res.elevenlabs_http_status ?? "?"}${res.elevenlabs_detail ? ` (${res.elevenlabs_detail})` : ""}.`
            : "";
        setErr(
          (res.note ||
            "No audio — add ELEVENLABS_API_KEY to backend/.env and restart the API.") + dbg,
        );
        return;
      }
      const b64 = res.audio_base64;

      let uri: string;
      if (Platform.OS === "web") {
        uri = `data:audio/mpeg;base64,${b64}`;
      } else {
        try {
          const file = new File(Paths.cache, `voice-contract-${Date.now()}.mp3`);
          file.write(b64, { encoding: "base64" });
          uri = file.uri;
          cleanupFile = () => {
            try {
              if (file.exists) file.delete();
            } catch {
              /* cache cleanup is best-effort */
            }
          };
        } catch {
          uri = `data:audio/mpeg;base64,${b64}`;
        }
      }

      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      voiceSoundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((st) => {
        if (st.isLoaded && st.didJustFinish) {
          void sound.unloadAsync();
          voiceSoundRef.current = null;
          cleanupFile?.();
        }
      });
    } catch (e) {
      cleanupFile?.();
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (!bundle && busy) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.accentMint} />
      </View>
    );
  }

  if (!bundle) {
    return (
      <View style={[styles.centered, { backgroundColor: COLORS.bg }]}>
        <Text style={styles.mutedCenter}>{err || "Failed to load deal."}</Text>
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
  const mwa = wallet.mobileWalletPubkey?.toBase58();

  const canBuyerLocal = !!wallet.primary && pri === buyerAddr;
  const canBuyerMwa = !!mwa && mwa === buyerAddr;
  const canBuyerOps = canBuyerLocal || canBuyerMwa;

  const canReleaseLocal =
    !!wallet.primary &&
    !!wallet.coSigner &&
    pri === buyerAddr &&
    cos === sellerAddr;
  const canReleaseMwa =
    !!wallet.coSigner && !!mwa && mwa === buyerAddr && cos === sellerAddr;
  const canRelease = canReleaseLocal || canReleaseMwa;

  const disputeSignerBuyer = wallet.primary && pri === buyerAddr ? wallet.primary : null;
  const disputeSignerSeller =
    wallet.primary && pri === sellerAddr
      ? wallet.primary
      : wallet.coSigner && cos === sellerAddr
        ? wallet.coSigner
        : null;
  const canDisputeBuyerMwa = !!mwa && mwa === buyerAddr;
  const canDisputeSellerMwa = !!mwa && mwa === sellerAddr;

  const canResolveLocal = !!wallet.arbiter && arbKp === arbAddr;
  const canResolveMwa = !!mwa && mwa === arbAddr;
  const canResolve = canResolveLocal || canResolveMwa;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
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

            <View style={styles.solShell}>
              <LinearGradient
                colors={[...GRADIENT_SOLANA_BAR]}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.solAccent}
              />
              <View style={styles.solBody}>
              <Text style={styles.solTitle}>Solana (devnet)</Text>
              <Text style={styles.solEyebrow}>PDAs · explorers</Text>
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
            </View>

            <View style={styles.onChainShell}>
              <LinearGradient
                colors={[...GRADIENT_SOLANA_BAR]}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.onChainAccent}
              />
              <View style={styles.onChainBody}>
              <Text style={styles.solTitle}>On-chain escrow</Text>
              <Text style={styles.onChainEyebrow}>SOLANA · DEVNET</Text>
              <Text style={styles.onChainMeta}>
                PDA status: {escrowStatus ?? "—"} · fund SOL on devnet first.
              </Text>
              {!wallet.primary && !canBuyerMwa ? (
                <Text style={styles.warn}>
                  Set buyer keys: open Wallets and generate/import the buyer key, or on Android link Phantom (MWA)
                  so the linked pubkey matches Buyer on this deal.
                </Text>
              ) : null}

              <ChainGradientButton
                label="1 · Initialize"
                disabled={chainBusy || !canBuyerOps}
                onPress={() =>
                  void runChain(async () => {
                    if (canBuyerLocal) {
                      return runInitialize(wallet.connection, wallet.primary!, bundle);
                    }
                    return runInitializeMwa(wallet.connection, bundle);
                  })
                }
              />

              <ChainGradientButton
                label="2 · Deposit lamports"
                disabled={chainBusy || !canBuyerOps}
                onPress={() =>
                  void runChain(async () => {
                    if (canBuyerLocal) {
                      return runDeposit(wallet.connection, wallet.primary!, bundle);
                    }
                    return runDepositMwa(wallet.connection, bundle);
                  })
                }
              />

              <ChainGradientButton
                label="Release (buyer + seller keys)"
                disabled={chainBusy || !canRelease}
                onPress={() =>
                  void runChain(async () => {
                    if (canReleaseLocal) {
                      return runReleaseMutual(
                        wallet.connection,
                        wallet.primary!,
                        wallet.coSigner!,
                        bundle,
                      );
                    }
                    return runReleaseMutualMwa(
                      wallet.connection,
                      wallet.coSigner!,
                      bundle,
                    );
                  })
                }
              />

              <ChainOutlineButton
                label="Dispute (buyer)"
                disabled={
                  chainBusy || !(disputeSignerBuyer || canDisputeBuyerMwa)
                }
                onPress={() =>
                  void runChain(async () => {
                    if (disputeSignerBuyer) {
                      return runOpenDispute(
                        wallet.connection,
                        disputeSignerBuyer,
                        bundle,
                      );
                    }
                    return runOpenDisputeMwa(wallet.connection, bundle, "buyer");
                  })
                }
              />

              <ChainOutlineButton
                label="Dispute (seller)"
                disabled={
                  chainBusy || !(disputeSignerSeller || canDisputeSellerMwa)
                }
                onPress={() =>
                  void runChain(async () => {
                    if (disputeSignerSeller) {
                      return runOpenDispute(
                        wallet.connection,
                        disputeSignerSeller,
                        bundle,
                      );
                    }
                    return runOpenDisputeMwa(wallet.connection, bundle, "seller");
                  })
                }
              />

              <ChainOutlineButton
                label="Resolve → seller (arbiter)"
                disabled={chainBusy || !canResolve}
                onPress={() =>
                  void runChain(async () => {
                    if (canResolveLocal) {
                      return runResolveDispute(
                        wallet.connection,
                        wallet.arbiter!,
                        bundle,
                        true,
                      );
                    }
                    return runResolveDisputeMwa(wallet.connection, bundle, true);
                  })
                }
              />

              <ChainOutlineButton
                label="Resolve → buyer refund (arbiter)"
                disabled={chainBusy || !canResolve}
                onPress={() =>
                  void runChain(async () => {
                    if (canResolveLocal) {
                      return runResolveDispute(
                        wallet.connection,
                        wallet.arbiter!,
                        bundle,
                        false,
                      );
                    }
                    return runResolveDisputeMwa(wallet.connection, bundle, false);
                  })
                }
              />

              {chainBusy ? (
                <ActivityIndicator style={{ marginTop: 10 }} color={COLORS.accentMint} />
              ) : null}
              </View>
            </View>

            <View style={styles.actions}>
              <ChainGradientButton
                label="Analyze chat (AI)"
                disabled={busy}
                onPress={() => void runAnalyze()}
              />
              <ChainOutlineButton
                label="Voice contract"
                disabled={busy}
                onPress={() => void playVoice()}
              />
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
                placeholderTextColor={COLORS.textFaint}
                multiline
              />
              <ChainGradientButton
                compact
                label="Send"
                disabled={busy}
                onPress={() => void send()}
              />
            </View>
            {err ? <Text style={styles.error}>{err}</Text> : null}
            {busy ? (
              <ActivityIndicator style={{ marginVertical: 8 }} color={COLORS.accentMint} />
            ) : null}
          </View>
        }
        data={messages}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={{
          paddingBottom: Math.max(32, insets.bottom + 16) + tabBarHeight,
        }}
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
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  mutedCenter: { color: COLORS.textMuted, textAlign: "center", marginBottom: 8 },
  title: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  meta: { marginTop: 4, color: COLORS.textMuted, fontSize: 12 },
  riskRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  riskLabel: { fontWeight: "600", color: COLORS.textMuted },
  riskValue: { fontWeight: "800", fontSize: 16 },
  rationale: { marginTop: 6, color: COLORS.textMuted, lineHeight: 20 },
  rowBetween: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: { fontWeight: "600", color: COLORS.textMuted },
  solTitle: { fontWeight: "700", marginBottom: 2, color: COLORS.text },
  mono: {
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    fontSize: 11,
    color: COLORS.text,
  },
  linkRow: { flexDirection: "row", marginTop: 8 },
  link: { color: COLORS.accentMint, fontWeight: "600" },
  smallChain: {
    marginTop: 8,
    fontSize: 10,
    color: COLORS.textFaint,
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  },
  solShell: {
    marginTop: 12,
    borderRadius: LAYOUT.cardRadius,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  solAccent: { height: 4, width: "100%" },
  solBody: {
    padding: 12,
    backgroundColor: COLORS.surfaceRaised,
  },
  solEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
    color: COLORS.accentLilac,
    marginBottom: 8,
    textTransform: "uppercase" as const,
  },
  onChainShell: {
    marginTop: 14,
    borderRadius: LAYOUT.cardRadius,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.tabBarBorder,
  },
  onChainAccent: { height: 4, width: "100%" },
  onChainBody: {
    padding: 12,
    gap: 10,
    backgroundColor: COLORS.surfaceMuted,
  },
  onChainEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: COLORS.accentMint,
    marginTop: -2,
    marginBottom: 4,
    textTransform: "uppercase" as const,
  },
  onChainMeta: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
  warn: { fontSize: 12, color: COLORS.warn, marginBottom: 2 },
  actions: { marginTop: 14, gap: 10 },
  chatTitle: { marginTop: 20, fontWeight: "700", fontSize: 16, color: COLORS.text },
  senderRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  senderInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.surfaceRaised,
    color: COLORS.text,
  },
  composer: { marginTop: 8, gap: 8 },
  msgInput: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    borderRadius: 10,
    padding: 10,
    backgroundColor: COLORS.surfaceRaised,
    textAlignVertical: "top",
    color: COLORS.text,
  },
  bubble: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: LAYOUT.cardRadius,
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  bubbleSender: { fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  bubbleBody: { color: COLORS.textMuted, lineHeight: 20 },
  error: { color: COLORS.danger, marginTop: 8 },
  secondary: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceRaised,
  },
  secondaryTxt: { fontWeight: "600", color: COLORS.textMuted },
});
