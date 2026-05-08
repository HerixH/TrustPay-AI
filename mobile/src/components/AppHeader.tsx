import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, LAYOUT } from '../theme';
import { LogoMark } from './LogoMark';

/** Toolbar height — use for vertical alignment (iOS-style 44pt) */
const TOOLBAR_H = 44;
const CTA_GRADIENT = ['#f5f5f5', '#cfcfd4'] as const;

type Props = {
  showPitchBanner?: boolean;
  onMenuPress?: () => void;
  onLaunchPress?: () => void;
};

export function AppHeader({
  showPitchBanner,
  onMenuPress,
  onLaunchPress,
}: Props) {
  return (
    <View style={styles.container}>
      {showPitchBanner ? (
        <View style={styles.banner}>
          <Text style={styles.bannerBrand}>TrustPay AI</Text>
          <Text style={styles.bannerText}>
            AI-Powered Smart Escrow & Fraud Detection for P2P
          </Text>
        </View>
      ) : null}

      <View style={styles.toolbar}>
        <View style={styles.leftCluster}>
          <LogoMark size={36} />
          <View style={styles.titleBlock}>
            <Text style={styles.wordmarkText} numberOfLines={1}>
              TrustPay AI
            </Text>
          </View>
        </View>

        <View style={styles.rightCluster}>
          <Pressable
            onPress={onMenuPress}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <View style={styles.menuLines}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </View>
          </Pressable>
          <Pressable
            onPress={onLaunchPress}
            style={({ pressed }) => pressed && styles.pressDown}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={[...CTA_GRADIENT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBorder}
            >
              <View style={styles.ctaInner}>
                <Text style={styles.ctaText}>+ Deal</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 6,
  },
  banner: {
    paddingVertical: 12,
    paddingHorizontal: LAYOUT.screenPadding,
    marginHorizontal: -LAYOUT.screenPadding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.borderSubtle,
    alignItems: 'center',
    gap: 6,
  },
  bannerBrand: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bannerText: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 15,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: TOOLBAR_H,
  },
  leftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: 10,
    paddingRight: 8,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  wordmarkText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSubtle,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  iconButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.95 }],
  },
  pressDown: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  menuLines: {
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLine: {
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.text,
  },
  ctaBorder: {
    borderRadius: 10,
    padding: 1,
  },
  ctaInner: {
    minHeight: 38,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
