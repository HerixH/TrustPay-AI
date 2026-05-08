import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { BracketTitle } from '../components/BracketTitle';
import { GlassCard } from '../components/GlassCard';
import { LiveHeader } from '../components/LiveHeader';
import { SparklineBars } from '../components/SparklineBars';
import type { RootTabParamList } from '../navigation/types';
import { screenScroll } from '../styles/screenScroll';
import { COLORS, GRADIENT_CTA, LAYOUT } from '../theme';

type Props = BottomTabScreenProps<RootTabParamList, 'Escrow'>;

const FEATURES = [
  {
    key: 'escrow',
    label: 'Smart escrow',
    sub: 'Blockchain-based lock & release rules',
    icon: 'lock-closed-outline' as const,
  },
  {
    key: 'fraud',
    label: 'TrustPay AI fraud detection',
    sub: 'Chat + behavior signals before release',
    icon: 'shield-checkmark-outline' as const,
  },
  {
    key: 'risk',
    label: 'Risk scoring dashboard',
    sub: 'Deal-level risk & status visibility',
    icon: 'stats-chart-outline' as const,
  },
  {
    key: 'voice',
    label: 'Voice contract confirmation',
    sub: 'Voice-assisted step checks (e.g. ElevenLabs)',
    icon: 'mic-outline' as const,
  },
  {
    key: 'disputes',
    label: 'Dispute resolution',
    sub: 'Contested releases & mediation workflows',
    icon: 'scale-outline' as const,
  },
] as const;

function formatUsdCompact(n: number) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

/** Thousands shown with space (dashboard-style) */
function formatCountSpaced(n: number) {
  return n.toLocaleString('en-US').replace(/,/g, ' ');
}

export function EscrowMarketingScreen({ navigation }: Props) {
  const tabBarHeight = useBottomTabBarHeight();
  const [safetyScore, setSafetyScore] = useState(91);
  const [fundsLocked, setFundsLocked] = useState(1_850_000);
  const [msgScanned, setMsgScanned] = useState(12_842);
  const [activeDeals, setActiveDeals] = useState(428);

  useEffect(() => {
    const id = setInterval(() => {
      setSafetyScore((s) =>
        Math.max(82, Math.min(98, Math.round(s + (Math.random() - 0.5) * 3))),
      );
      setFundsLocked((f) =>
        Math.max(1_200_000, Math.round(f + (Math.random() - 0.5) * 80_000)),
      );
      setMsgScanned((m) => m + Math.floor(Math.random() * 15));
      setActiveDeals((d) =>
        Math.max(360, Math.round(d + (Math.random() - 0.5) * 6)),
      );
    }, 2300);
    return () => clearInterval(id);
  }, []);

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
            onLaunchPress={() => navigation.navigate('Live')}
            onMenuPress={() =>
              navigation.navigate('Home', { screen: 'Landing' })
            }
          />

          <LiveHeader />

          <View style={styles.titleRow}>
            <View style={styles.titleFlex}>
              <BracketTitle title="ESCROW" />
            </View>
            <View style={[styles.scorePill, { borderColor: COLORS.success }]}>
              <Text style={[styles.scorePillVal, { color: COLORS.success }]}>
                {safetyScore}
              </Text>
              <Text style={styles.scorePillHint}>Safety</Text>
            </View>
          </View>

          <Text style={styles.body}>
            TrustPay AI holds funds in escrow while AI reads in-app
            conversations and behavior to flag scam risk. Only then is money
            released, delayed, or sent into dispute.
          </Text>

          <GlassCard accent="top" style={styles.block}>
            <Text style={styles.heroEyebrow}>SNAPSHOT · DEMO DATA</Text>
            <View style={styles.heroRow}>
              <LinearGradient
                colors={[...GRADIENT_CTA]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroIconRing}
              >
                <View style={styles.heroIconInner}>
                  <Ionicons
                    name="shield-checkmark"
                    size={34}
                    color={COLORS.text}
                  />
                </View>
              </LinearGradient>
              <View style={styles.heroStats}>
                <View style={[styles.heroMiniRow, styles.heroStatRowDivider]}>
                  <View style={[styles.miniStat, styles.miniStatLeft]}>
                    <Text style={styles.miniLab}>Active deals</Text>
                    <Text style={styles.miniVal}>
                      {formatCountSpaced(activeDeals)}
                    </Text>
                  </View>
                  <View style={styles.miniStat}>
                    <Text style={styles.miniLab}>In escrow</Text>
                    <Text style={styles.miniVal}>
                      {formatUsdCompact(fundsLocked)}
                    </Text>
                  </View>
                </View>
                <View style={styles.heroMiniRow}>
                  <View style={[styles.miniStat, styles.miniStatLeft]}>
                    <Text style={styles.miniLab}>Messages scanned</Text>
                    <Text style={styles.miniVal}>
                      {formatCountSpaced(msgScanned)}
                    </Text>
                  </View>
                  <View style={styles.miniStat}>
                    <Text style={styles.miniLab}>Chain</Text>
                    <Text style={styles.miniVal}>Solana</Text>
                  </View>
                </View>
              </View>
            </View>
          </GlassCard>

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Risk index</Text>
            <View style={styles.badge}>
              <Ionicons
                name="chatbubbles-outline"
                size={15}
                color={COLORS.textMuted}
              />
              <Text style={styles.badgeText}>Chat + behavior</Text>
            </View>
          </View>
          <GlassCard style={styles.block} innerStyle={styles.riskCardInner}>
            <SparklineBars />
            <Text style={styles.chartCaption}>
              Simulated scoring from cadence, urgency, and wallet cues.
            </Text>
          </GlassCard>

          <Text style={styles.sectionLabel}>CAPABILITIES</Text>
          <View style={styles.featureGrid}>
            {FEATURES.map((f) => (
              <Pressable
                key={f.key}
                android_ripple={{ color: 'rgba(255,255,255,0.06)' }}
                style={({ pressed }) => [
                  styles.featureCard,
                  pressed && styles.pressed,
                ]}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featureIconBG}
                >
                  <Ionicons name={f.icon} size={20} color={COLORS.text} />
                </LinearGradient>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{f.label}</Text>
                  <Text style={styles.featureSub}>{f.sub}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.textFaint}
                />
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => navigation.navigate('Live')}
            style={({ pressed }) => [styles.feedLink, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={[...GRADIENT_CTA]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.feedLinkGrad}
            >
              <View style={styles.feedLinkInner}>
                <Ionicons name="pulse" size={18} color={COLORS.text} />
                <Text style={styles.feedLinkText}>View activity stream</Text>
              </View>
            </LinearGradient>
          </Pressable>
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
  block: {
    marginBottom: LAYOUT.blockGap,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  titleFlex: {
    flex: 1,
    minWidth: 0,
  },
  scorePill: {
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.surfaceRaised,
    alignItems: 'flex-end',
  },
  scorePillVal: {
    fontSize: 17,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  scorePillHint: {
    color: COLORS.textFaint,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  body: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: LAYOUT.blockGap,
  },
  heroEyebrow: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 18,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  heroIconRing: {
    padding: 3,
    borderRadius: 999,
  },
  heroIconInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSubtle,
  },
  heroStats: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  heroMiniRow: {
    flexDirection: 'row',
    gap: 0,
  },
  heroStatRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderSubtle,
    paddingBottom: 14,
    marginBottom: 14,
  },
  miniStat: {
    flex: 1,
    minWidth: 0,
  },
  miniStatLeft: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: COLORS.borderSubtle,
    paddingRight: 14,
    marginRight: 14,
  },
  miniLab: {
    color: COLORS.textMuted,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  miniVal: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 6,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSubtle,
  },
  badgeText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  riskCardInner: {
    padding: 22,
  },
  chartCaption: {
    marginTop: 18,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    marginTop: 12,
    marginBottom: 14,
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  featureGrid: {
    marginTop: 0,
    gap: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: LAYOUT.cardRadius,
    backgroundColor: COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSubtle,
  },
  featureIconBG: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.glassBorder,
  },
  featureText: {
    flex: 1,
    minWidth: 0,
  },
  featureTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  featureSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  feedLink: {
    marginTop: LAYOUT.sectionGap,
    borderRadius: LAYOUT.cardRadius,
    overflow: 'hidden',
  },
  feedLinkGrad: {
    padding: 1,
    borderRadius: LAYOUT.cardRadius,
  },
  feedLinkInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: LAYOUT.cardRadius - 1,
    backgroundColor: COLORS.surfaceRaised,
  },
  feedLinkText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
