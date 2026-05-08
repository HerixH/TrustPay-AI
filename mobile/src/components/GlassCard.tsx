import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENT_CTA, LAYOUT } from '../theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  accent?: 'top' | 'none';
};

export function GlassCard({
  children,
  style,
  innerStyle,
  accent = 'none',
}: Props) {
  return (
    <View style={[styles.wrap, style]}>
      {accent === 'top' ? (
        <LinearGradient
          colors={[...GRADIENT_CTA]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentBar}
        />
      ) : null}
      <View style={[styles.inner, innerStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: LAYOUT.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
  inner: {
    padding: LAYOUT.cardPadding,
  },
});
