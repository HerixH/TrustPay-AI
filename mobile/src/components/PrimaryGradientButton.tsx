import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  COLORS,
  GRADIENT_CTA,
  GRADIENT_CTA_LOCATIONS,
  LAYOUT,
} from '../theme';

type Props = {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
};

export function PrimaryGradientButton({ label, onPress, icon }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pressWrap, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={[...GRADIENT_CTA]}
        locations={[...GRADIENT_CTA_LOCATIONS]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.grad}
      >
        <View style={styles.row}>
          {icon}
          <Text style={styles.label}>{label}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressWrap: {
    borderRadius: LAYOUT.cardRadius,
    overflow: 'hidden',
    flex: 1,
    minHeight: 54,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  grad: {
    flex: 1,
    minHeight: 54,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    color: COLORS.textOnGradient,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
