import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENT_BAR_RISK_INDEX } from '../theme';

const BARS = 25;
const CHART_H = 76;
const BAR_TOP_RADIUS = 6;

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
      {heights.map((h, i) => {
        const hPx = Math.max(8, h * CHART_H);
        return (
          <View key={`b-${i}`} style={styles.slot}>
            <View
              style={[
                styles.barClip,
                {
                  height: hPx,
                  borderTopLeftRadius: BAR_TOP_RADIUS,
                  borderTopRightRadius: BAR_TOP_RADIUS,
                },
              ]}
            >
              <LinearGradient
                colors={[...GRADIENT_BAR_RISK_INDEX]}
                locations={[0, 0.22, 0.45, 0.72, 1]}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 0.5, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_H,
    gap: 2,
    paddingHorizontal: 6,
  },
  slot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  barClip: {
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    opacity: 0.98,
  },
});
