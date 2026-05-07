import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENT_RAINBOW } from '../theme';

const BARS = 24;
const CHART_H = 56;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function SparklineBars() {
  const [heights, setHeights] = useState(() =>
    Array.from({ length: BARS }, () => 0.35 + Math.random() * 0.55),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setHeights((prev) =>
        prev.map((h) => {
          const jitter = (Math.random() - 0.5) * 0.22;
          return clamp(h + jitter, 0.12, 1);
        }),
      );
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.wrap}>
      {heights.map((h, i) => (
        <View key={`b-${i}`} style={styles.slot}>
          <LinearGradient
            colors={[...GRADIENT_RAINBOW]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={[styles.bar, { height: Math.max(4, h * CHART_H) }]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_H,
    gap: 2,
    paddingHorizontal: 2,
  },
  slot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 2,
    opacity: 0.68,
  },
});
