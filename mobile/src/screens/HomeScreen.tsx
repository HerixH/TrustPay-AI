import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "../navigation/types";
import { listDeals, type DealRow } from "../api";
import { API_BASE } from "../constants";
import { COLORS, LAYOUT } from "../theme";

type Props = NativeStackScreenProps<HomeStackParamList, "Deals">;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      setDeals(await listDeals());
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TrustPay AI</Text>
      <Text style={styles.sub}>API: {API_BASE}</Text>

      <Pressable
        style={styles.secondary}
        onPress={() => navigation.navigate("Wallet")}
      >
        <Text style={styles.secondaryTxt}>Wallets & keys</Text>
      </Pressable>

      <Pressable
        style={styles.primary}
        onPress={() => navigation.navigate("DealCreate")}
      >
        <Text style={styles.primaryTxt}>New escrow deal</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={load}>
        <Text style={styles.secondaryTxt}>Refresh list</Text>
      </Pressable>

      {loading && (
        <ActivityIndicator style={{ marginTop: 16 }} color={COLORS.accentMint} />
      )}
      {err ? <Text style={styles.error}>{err}</Text> : null}

      <FlatList
        style={{ marginTop: 12, width: "100%" }}
        data={deals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Math.max(24, insets.bottom + 16) + tabBarHeight,
        }}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>No deals yet.</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              navigation.navigate("DealDetail", { dealId: item.id })
            }
          >
            <Text style={styles.cardTitle}>{item.id.slice(0, 8)}…</Text>
            <Text style={styles.meta}>
              λ {item.amount_lamports} • seed {item.deal_seed}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: LAYOUT.screenPadding,
    paddingTop: 48,
    backgroundColor: COLORS.bg,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  sub: { marginTop: 4, fontSize: 12, color: COLORS.textFaint },
  primary: {
    marginTop: 18,
    backgroundColor: COLORS.accentPurple,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryTxt: { color: COLORS.textOnGradient, fontWeight: "700", fontSize: 15 },
  secondary: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: COLORS.surfaceRaised,
  },
  secondaryTxt: { fontWeight: "600", color: COLORS.textMuted },
  error: { color: COLORS.danger, marginTop: 12 },
  empty: { color: COLORS.textFaint, marginTop: 8 },
  card: {
    backgroundColor: COLORS.surfaceRaised,
    padding: 14,
    borderRadius: LAYOUT.cardRadius,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  cardTitle: { fontWeight: "700", color: COLORS.text },
  meta: { marginTop: 4, color: COLORS.textMuted, fontSize: 12 },
});
