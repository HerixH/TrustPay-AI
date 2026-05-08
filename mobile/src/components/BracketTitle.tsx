import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENT_RAINBOW } from '../theme';

type Props = {
  title: string;
};

/** Section title with accent lines — aligned to design system */
export function BracketTitle({ title }: Props) {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[...GRADIENT_RAINBOW]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBar}
      />
      <LinearGradient
        colors={[...GRADIENT_RAINBOW]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.leftBar}
      />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    paddingTop: 16,
    paddingLeft: 16,
    marginBottom: 4,
    minHeight: 56,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 40,
    height: 2,
    borderRadius: 1,
  },
  leftBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 2,
    bottom: 6,
    borderRadius: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
