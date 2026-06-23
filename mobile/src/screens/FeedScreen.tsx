import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { LiveHeader } from '../components/LiveHeader';
import { listActivity, type ActivityItem } from '../api';
import type { RootTabParamList } from '../navigation/types';
import { screenScroll } from '../styles/screenScroll';
import { COLORS, LAYOUT } from '../theme';

type Props = BottomTabScreenProps<RootTabParamList, 'Live'>;

type Tone = ActivityItem['tone'];

function formatTime(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleTimeString(undefined, {
    hour12: false,
  });
}

function toneAccent(tone: Tone): string {
  switch (tone) {
    case 'good':
      return COLORS.text;
    case 'warn':
      return COLORS.warn;
    case 'bad':
      return COLORS.danger;
    default:
      return COLORS.textFaint;
  }
}

export function FeedScreen({ navigation }: Props) {
  const tabBarHeight = useBottomTabBarHeight();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const next = await listActivity(50);
      setItems(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load activity');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
      const id = setInterval(() => {
        void load();
      }, 5000);
      return () => clearInterval(id);
    }, [load]),
  );

  const liveCount = useMemo(
    () =>
      items.length === 0
        ? 'No events yet'
        : `${items.length} live event${items.length === 1 ? '' : 's'}`,
    [items.length],
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={[
            screenScroll.content,
            {
              paddingBottom: tabBarHeight + LAYOUT.sectionGap + 36,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <AppHeader
            onLaunchPress={() => navigation.navigate('Escrow')}
            onMenuPress={() =>
              navigation.navigate('Home', { screen: 'Landing' })
            }
          />
          <LiveHeader />

          <Text style={styles.feedEyebrow}>TrustPay AI</Text>

          <View style={styles.sectionHead}>
            <Text style={styles.feedTitle}>Activity stream</Text>
            <View style={styles.bufferPill}>
              <Ionicons name="pulse" size={14} color={COLORS.textMuted} />
              <Text style={styles.bufferText}>{liveCount}</Text>
            </View>
          </View>

          {loading && items.length === 0 ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color={COLORS.textMuted} />
              <Text style={styles.stateText}>Loading live activity…</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.stateBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={() => void load()} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>
                No activity yet. Create a deal, send chat messages, or run Analyze
                from a deal room to populate this feed.
              </Text>
            </View>
          ) : null}

          <View style={styles.list}>
            {items.map((it) => (
              <GlassCard key={it.id} innerStyle={styles.cardInner}>
                <View style={styles.cardRow}>
                  <View
                    style={[
                      styles.accent,
                      { backgroundColor: toneAccent(it.tone) },
                    ]}
                  />
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{it.title}</Text>
                    <Text style={styles.cardDetail}>{it.detail}</Text>
                  </View>
                  <Text style={styles.cardTime}>
                    {formatTime(it.created_at)}
                  </Text>
                </View>
              </GlassCard>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
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
  feedEyebrow: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  feedTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  bufferPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSubtle,
    maxWidth: '52%',
  },
  bufferText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.15,
    flexShrink: 1,
  },
  stateBox: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  stateText: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSubtle,
  },
  retryText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
  cardInner: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
  },
  accent: {
    width: 4,
    borderRadius: 3,
    alignSelf: 'stretch',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  cardDetail: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  cardTime: {
    color: COLORS.textFaint,
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    alignSelf: 'flex-start',
    marginTop: 2,
  },
});
