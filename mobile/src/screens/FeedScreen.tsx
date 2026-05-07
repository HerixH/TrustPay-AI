import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { GridBackground } from '../components/GridBackground';
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

  const toneBar = (tone: Tone) => {
    switch (tone) {
      case 'good':
        return COLORS.success;
      case 'warn':
        return '#fbbf24';
      case 'bad':
        return COLORS.danger;
      default:
        return COLORS.live;
    }
  };

  return (
    <View style={styles.screen}>
      <GridBackground />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={[
            screenScroll.content,
            { paddingBottom: tabBarHeight + LAYOUT.sectionGap },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <AppHeader
            onLaunchPress={() => navigation.navigate('Escrow')}
            onMenuPress={() => navigation.navigate('Home')}
          />
          <LiveHeader />
          <Text style={styles.head}>TrustPay AI</Text>
          <Text style={styles.headSub}>Activity stream</Text>
          <Text style={styles.meta}>{liveCount}</Text>

          <View style={styles.list}>
            {items.map((it) => (
              <GlassCard key={it.id}>
                <View style={styles.cardRow}>
                  <View
                    style={[
                      styles.accent,
                      { backgroundColor: toneBar(it.tone) },
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
  head: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.15,
    marginBottom: 2,
  },
  headSub: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    color: COLORS.textFaint,
    fontSize: 12,
    marginBottom: 16,
    fontWeight: '500',
  },
  list: {
    gap: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  accent: {
    width: 3,
    borderRadius: 2,
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
  },
});
