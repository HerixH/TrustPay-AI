import type { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, LAYOUT } from '../theme';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  accent?: 'top' | 'none';
};

export function GlassCard({ children, style, accent = 'none' }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      {accent === 'top' ? (
        <LinearGradient
          colors={['#f3f4f6', '#a1a1aa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentBar}
        />
      ) : null}
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: LAYOUT.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(9, 10, 12, 0.9)',
    overflow: 'hidden',
  },
  accentBar: {
    height: 2,
    width: '100%',
  },
  inner: {
    padding: LAYOUT.cardPadding,
  },
});
