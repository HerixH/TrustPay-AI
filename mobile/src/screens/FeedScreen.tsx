import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { LiveHeader } from '../components/LiveHeader';
import type { RootTabParamList } from '../navigation/types';
import { screenScroll } from '../styles/screenScroll';
import { COLORS, LAYOUT } from '../theme';

type Props = BottomTabScreenProps<RootTabParamList, 'Live'>;

type Tone = 'good' | 'warn' | 'bad' | 'neutral';

type FeedItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  tone: Tone;
};

const TEMPLATES: Omit<FeedItem, 'id' | 'time'>[] = [
  {
    title: 'User initiated a deal',
    detail: 'Buyer funded escrow · Deal #TP-1204',
    tone: 'good',
  },
  {
    title: 'Seller message flagged',
    detail: 'Urgency + off-platform cue · risk elevated',
    tone: 'warn',
  },
  {
    title: 'AI: scam risk flagged',
    detail: 'Chat + behavior model · auto-hold engaged',
    tone: 'warn',
  },
  {
    title: 'Funds remain protected',
    detail: 'Release blocked until review / dispute path',
    tone: 'neutral',
  },
  {
    title: 'Voice contract check',
    detail: 'Step confirmation via voice (ElevenLabs)',
    tone: 'neutral',
  },
  {
    title: 'Dispute ticket opened',
    detail: 'Evidence window · 48h SLA (demo)',
    tone: 'bad',
  },
  {
    title: 'Legit deal: funds released',
    detail: 'Rules satisfied · seller payout queued',
    tone: 'good',
  },
];

function makeItem(): FeedItem {
  const t = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  const now = new Date();
  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    time: now.toLocaleTimeString(undefined, { hour12: false }),
    ...t,
  };
}

function toneAccent(tone: Tone): string {
  switch (tone) {
    case 'good':
      return COLORS.text;
    case 'warn':
      return '#eab308';
    case 'bad':
      return COLORS.danger;
    default:
      return COLORS.textFaint;
  }
}

export function FeedScreen({ navigation }: Props) {
  const tabBarHeight = useBottomTabBarHeight();
  const [items, setItems] = useState<FeedItem[]>(() =>
    Array.from({ length: 6 }, () => makeItem()),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setItems((prev) => [makeItem(), ...prev].slice(0, 14));
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const liveCount = useMemo(
    () => `${items.length} events in buffer`,
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
            onMenuPress={() => navigation.navigate('Home')}
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
                  <Text style={styles.cardTime}>{it.time}</Text>
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
