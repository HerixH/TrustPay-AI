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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { GridBackground } from '../components/GridBackground';
import { HeroPanel } from '../components/HeroPanel';
import { LiveHeader } from '../components/LiveHeader';
import { COLORS, GRADIENT_RAINBOW, LAYOUT } from '../theme';
import { screenScroll } from '../styles/screenScroll';
import type { RootTabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<RootTabParamList, 'Home'>;

const HOW_IT_WORKS = [
  'Buyer creates a deal',
  'Funds are locked in escrow',
  'Buyer and seller chat in-app',
  'AI analyzes messages and flags risks',
  'Payment is released—or dispute opens',
] as const;

export function LandingScreen({ navigation }: Props) {
  const tabBarHeight = useBottomTabBarHeight();
  const [deals, setDeals] = useState(428);
  const [flags, setFlags] = useState(186);
  const [protectedValue, setProtectedValue] = useState(4.2);

  useEffect(() => {
    const id = setInterval(() => {
      setDeals((d) => Math.max(320, Math.round(d + (Math.random() - 0.5) * 5)));
      setFlags((f) => Math.max(120, Math.round(f + (Math.random() - 0.5) * 4)));
      setProtectedValue((x) =>
        +(x + (Math.random() - 0.5) * 0.05).toFixed(2),
      );
    }, 2600);
    return () => clearInterval(id);
  }, []);

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
            showPitchBanner
            onLaunchPress={() => navigation.navigate('Escrow')}
            onMenuPress={() => navigation.navigate('Live')}
          />

          <LiveHeader />

          <Text style={styles.team}>Team Chain Minds · TrustPay AI</Text>

          <GlassCard accent="top" style={styles.block}>
            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={styles.metricLab}>Active escrows</Text>
                <Text style={styles.metricVal}>{deals.toLocaleString()}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metric}>
                <Text style={styles.metricLab}>AI flags / 24h</Text>
                <Text style={styles.metricVal}>{flags.toLocaleString()}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metric}>
                <Text style={styles.metricLab}>Protected ($M)</Text>
                <Text style={styles.metricVal}>{protectedValue.toFixed(2)}</Text>
              </View>
            </View>
          </GlassCard>

          <HeroPanel />

          <GlassCard style={styles.block}>
            <Text style={styles.flowTitle}>How it works</Text>
            {HOW_IT_WORKS.map((step, i) => (
              <View
                key={step}
                style={[
                  styles.flowRow,
                  i === HOW_IT_WORKS.length - 1 && styles.flowRowLast,
                ]}
              >
                <Text style={styles.flowIdx}>
                  {String(i + 1).padStart(2, '0')}
                </Text>
                <Text style={styles.flowText}>{step}</Text>
              </View>
            ))}
          </GlassCard>

          <GlassCard style={styles.block}>
            <Text style={styles.quoteLabel}>Demo scenario</Text>
            <Text style={styles.quote}>
              Seller sent a suspicious message—why are funds still protected?
            </Text>
            <Text style={styles.quoteHint}>
              AI flags risk; escrow stays locked until rules pass.
            </Text>
          </GlassCard>

          <View style={styles.footerBlock}>
            <Text style={styles.kicker}>Trust infrastructure</Text>
            <Text style={styles.footerBrand}>TrustPay AI</Text>
            <Text style={styles.sub}>
              Security, intelligence, and usability for P2P payments—especially
              in emerging markets.
            </Text>
          </View>

          <View style={styles.ctaRow}>
            <Pressable
              onPress={() => navigation.navigate('Escrow')}
              style={({ pressed }) => [
                styles.primaryCta,
                pressed && { opacity: 0.92 },
              ]}
            >
              <LinearGradient
                colors={[...GRADIENT_RAINBOW]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryCtaGrad}
              >
                <Text style={styles.primaryCtaText}>
                  Escrow & risk dashboard
                </Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Live')}
              style={styles.secondaryCta}
            >
              <Text style={styles.secondaryCtaText}>Activity stream</Text>
            </Pressable>
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
  block: {
    marginBottom: LAYOUT.blockGap,
  },
  team: {
    color: COLORS.textFaint,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: LAYOUT.blockGap,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  metric: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  metricLab: {
    color: COLORS.textFaint,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  metricVal: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.borderSubtle,
    marginVertical: 2,
  },
  flowTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderSubtle,
  },
  flowRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  flowIdx: {
    color: COLORS.live,
    fontSize: 12,
    fontWeight: '700',
    minWidth: 26,
    fontVariant: ['tabular-nums'],
  },
  flowText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  quoteLabel: {
    color: COLORS.textFaint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  quote: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '600',
  },
  quoteHint: {
    marginTop: 10,
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  footerBlock: {
    marginTop: LAYOUT.sectionGap,
    gap: 8,
  },
  kicker: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  footerBrand: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sub: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  ctaRow: {
    marginTop: LAYOUT.sectionGap,
    gap: 10,
  },
  primaryCta: {
    borderRadius: LAYOUT.cardRadius,
    overflow: 'hidden',
  },
  primaryCtaGrad: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: LAYOUT.cardRadius,
  },
  primaryCtaText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  secondaryCta: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  secondaryCtaText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
