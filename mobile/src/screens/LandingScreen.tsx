import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppFooter } from '../components/AppFooter';
import { GlassCard } from '../components/GlassCard';
import { HeroPanel } from '../components/HeroPanel';
import { HomeSearchRow } from '../components/HomeSearchRow';
import { LiveHeader } from '../components/LiveHeader';
import { PrimaryGradientButton } from '../components/PrimaryGradientButton';
import { COLORS, LAYOUT } from '../theme';
import { screenScroll } from '../styles/screenScroll';
import type { HomeStackParamList, RootTabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Landing'>,
  BottomTabScreenProps<RootTabParamList>
>;

const HOW_IT_WORKS = [
  'Buyer creates a deal',
  'Funds are locked in escrow',
  'Buyer and seller chat in-app',
  'AI analyzes messages and flags risks',
  'Payment is released, or dispute opens',
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
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={[
            screenScroll.content,
            {
              paddingBottom:
                tabBarHeight + LAYOUT.sectionGap + 36,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <HomeSearchRow
            onSearchPress={() => navigation.navigate('Escrow')}
            onFilterPress={() => navigation.navigate('Live')}
            onDealPress={() => navigation.navigate('Escrow')}
          />

          <LiveHeader />

          <Text style={styles.team}>Team Chain Minds · TrustPay AI</Text>

          <GlassCard accent="top" style={styles.block}>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCell}>
                <Text style={styles.metricLab}>Active escrows</Text>
                <Text style={styles.metricVal}>{deals.toLocaleString()}</Text>
              </View>
              <View style={styles.metricCell}>
                <Text style={styles.metricLab}>AI flags / 24h</Text>
                <Text style={styles.metricVal}>{flags.toLocaleString()}</Text>
              </View>
              <View style={styles.metricCell}>
                <Text style={styles.metricLab}>Protected ($M)</Text>
                <Text style={styles.metricVal}>{protectedValue.toFixed(2)}</Text>
              </View>
              <View style={styles.metricCell}>
                <Text style={styles.metricLab}>Network status</Text>
                <View style={styles.statusDotRow}>
                  <View style={styles.greenDot} />
                  <Text style={styles.metricValSmall}>Healthy</Text>
                </View>
              </View>
            </View>
          </GlassCard>

          <HeroPanel />

          <GlassCard style={styles.block}>
            <Text style={styles.flowTitle}>Use TrustPay</Text>
            <Pressable
              style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
              onPress={() => navigation.navigate('Deals')}
              accessibilityRole="button"
              accessibilityLabel="Open my deals"
            >
              <Ionicons name="list-outline" size={20} color={COLORS.accentTeal} />
              <Text style={styles.linkText}>My deals</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textFaint} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
              onPress={() => navigation.navigate('DealCreate')}
              accessibilityRole="button"
              accessibilityLabel="Create a new deal"
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.accentTeal} />
              <Text style={styles.linkText}>Create deal</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textFaint} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.linkRow, styles.linkRowLast, pressed && styles.pressed]}
              onPress={() => navigation.navigate('Wallet')}
              accessibilityRole="button"
              accessibilityLabel="Open wallets"
            >
              <Ionicons name="wallet-outline" size={20} color={COLORS.accentTeal} />
              <Text style={styles.linkText}>Wallets & connect</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textFaint} />
            </Pressable>
          </GlassCard>

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
                <Text style={styles.flowIdx}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={styles.flowText}>{step}</Text>
              </View>
            ))}
          </GlassCard>

          <GlassCard style={styles.block}>
            <Text style={styles.quoteLabel}>Demo scenario</Text>
            <Text style={styles.quote}>
              Seller sent a suspicious message. Why are funds still protected?
            </Text>
            <Text style={styles.quoteHint}>
              AI flags risk; escrow stays locked until rules pass.
            </Text>
          </GlassCard>

          <AppFooter />

          <View style={styles.ctaRow}>
            <Pressable
              style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Share"
            >
              <Ionicons name="share-outline" size={22} color={COLORS.text} />
            </Pressable>
            <PrimaryGradientButton
              label="Get payment alerts"
              onPress={() => navigation.navigate('Live')}
              icon={
                <Ionicons name="notifications-outline" size={22} color={COLORS.bg} />
              }
            />
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
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: LAYOUT.blockGap,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginTop: -4,
  },
  metricCell: {
    width: '50%',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderSubtle,
  },
  metricLab: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  metricVal: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metricValSmall: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
  },
  flowTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderSubtle,
  },
  linkRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  linkText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
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
    color: COLORS.textMuted,
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
  ctaRow: {
    marginTop: LAYOUT.sectionGap,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  shareBtn: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSubtle,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
});
