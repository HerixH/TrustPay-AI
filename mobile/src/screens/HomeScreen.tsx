import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { listDeals, type DealRow } from "../api";
import { API_BASE } from "../constants";

type Props = NativeStackScreenProps<RootStackParamList, "Deals">;

export function HomeScreen({ navigation }: Props) {
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

      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      {err && <Text style={styles.error}>{err}</Text>}

      <FlatList
        style={{ marginTop: 12, width: "100%" }}
        data={deals}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: "#64748b", marginTop: 8 }}>No deals yet.</Text>
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
  container: { flex: 1, padding: 20, paddingTop: 48, backgroundColor: "#f8fafc" },
  title: { fontSize: 24, fontWeight: "700", color: "#0f172a" },
  sub: { marginTop: 4, fontSize: 12, color: "#64748b" },
  primary: {
    marginTop: 18,
    backgroundColor: "#0ea5e9",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryTxt: { color: "#fff", fontWeight: "700" },
  secondary: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  secondaryTxt: { fontWeight: "600", color: "#334155" },
  error: { color: "#b91c1c", marginTop: 12 },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardTitle: { fontWeight: "700", color: "#0f172a" },
  meta: { marginTop: 4, color: "#475569", fontSize: 12 },
});
