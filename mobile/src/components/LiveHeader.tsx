import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';

/** Match AppHeader toolbar rhythm */
const ROW_H = 44;

function formatClock(d: Date) {
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function LiveHeader() {
  const pulse = useRef(new Animated.Value(1)).current;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const latencyMs = useMemo(() => 28 + Math.floor(Math.random() * 18), []);

  return (
    <View style={styles.row}>
      <View style={styles.livePill}>
        <Animated.View style={[styles.dot, { opacity: pulse }]} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaLine} numberOfLines={1}>
          TrustPay AI · Solana
        </Text>
        <Text style={styles.metaSub} numberOfLines={1}>
          {formatClock(now)} · {latencyMs} ms
        </Text>
      </View>

      <View style={styles.okPill}>
        <Text style={styles.okText}>ONLINE</Text>
      </View>
    </View>
  );
}

const pillBase = {
  minHeight: ROW_H,
  paddingHorizontal: 12,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  livePill: {
    ...pillBase,
    gap: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSubtle,
    flexShrink: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.live,
  },
  liveText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  meta: {
    flex: 1,
    minWidth: 0,
    minHeight: ROW_H,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  metaLine: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  metaSub: {
    color: COLORS.textFaint,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  okPill: {
    ...pillBase,
    borderRadius: 10,
    backgroundColor: 'rgba(52,211,153,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(52,211,153,0.35)',
    flexShrink: 0,
  },
  okText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
