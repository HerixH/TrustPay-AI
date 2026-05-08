import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';
import { GlassCard } from './GlassCard';

/** Minimal hero — no illustration assets */
export function HeroPanel() {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        <LinearGradient
          colors={['#f5f5f5', '#a1a1aa']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.accentStripe}
        />
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark" size={26} color="#e5e7eb" />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Escrow with AI oversight</Text>
          <Text style={styles.sub}>
            Payments stay protected while messages and behavioral signals are
            scored before any release.
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  accentStripe: {
    width: 3,
    alignSelf: 'stretch',
    minHeight: 72,
    borderRadius: 2,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  sub: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});
